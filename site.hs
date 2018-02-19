--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}

import Data.Monoid (mappend)
import Hakyll
import System.FilePath
import Text.Pandoc.Options
import Control.Monad (liftM)
import Data.Monoid ((<>))
import qualified Data.Map as M
import Text.Regex
import Data.List (groupBy)

--------------------------------------------------------------------------------
main :: IO ()
main =
  hakyllWith config $ do
    match "assets/**" $ do
      route assetRoute
      compile copyFileCompiler
    match "posts/*" $ do
      route $ composeRoutes slugRoute $ setExtension "html"
      compile $
        customPandocCompiler >>=
        saveSnapshot "content" >>=
        loadAndApplyTemplate "templates/post.html" postCtx >>=
        loadAndApplyTemplate "templates/default.html" postCtx >>=
        relativizeUrls
    match "pages/projects/*" $ do
      route $ composeRoutes slugRoute $ setExtension "html"
      compile $
        customPandocCompiler >>=
        loadAndApplyTemplate "templates/project.html" postCtx >>=
        loadAndApplyTemplate "templates/default.html" postCtx >>=
        relativizeUrls
    match "pages/*" $ do
      route $ composeRoutes slugRoute $ setExtension "html"
      compile $
        customPandocCompiler >>=
        loadAndApplyTemplate "templates/page.html" postCtx >>=
        loadAndApplyTemplate "templates/default.html" postCtx >>=
        relativizeUrls

    create ["pages/projects.html"] $ do
      route idRoute
      compile $ do
        projects <- loadAll "pages/projects/*"
        let projectCtx =
              listField "projects" defaultContext (return projects) <>
              constField "title" "Projects" <>
              defaultContext
        makeItem "" >>=
          loadAndApplyTemplate "templates/projects.html" projectCtx >>=
          loadAndApplyTemplate "templates/default.html" projectCtx >>=
          relativizeUrls

    create ["archives.html"] $ do
      route idRoute
      compile $ do
        posts <- fmap groupPosts $ recentFirst =<< loadAll "posts/*"
        let archiveCtx =
              listField "months" (
                      field "month" (return . fst . itemBody) <>
                      listFieldWith "posts" teaserCtx
                          (return . snd . itemBody))
                  (sequence $ fmap (\(y, is) -> makeItem (show y, is)) posts) <>
              constField "title" "Archives" <>
              defaultContext
        makeItem "" >>= loadAndApplyTemplate "templates/archives.html" archiveCtx >>=
          loadAndApplyTemplate "templates/default.html" archiveCtx >>=
          relativizeUrls

    pag <- paginate "posts/*"
    paginateRules pag $ \pageNum pattern -> do
      route idRoute
      compile $ do
          posts <- recentFirst =<< loadAllSnapshots pattern "content"
          let paginateCtx = paginateContext pag pageNum
              indexCtx =
                  listField "posts" teaserCtx (return posts) <>
                  constField "title" "Home" <>
                  paginateContextPlus pag pageNum <>
                  defaultContext
          makeItem "" >>=
              loadAndApplyTemplate "templates/index.html" indexCtx >>=
              loadAndApplyTemplate "templates/default.html" indexCtx >>=
              relativizeUrls
    match "404.html" $ do
      route idRoute
      compile $
        getResourceBody >>= applyAsTemplate postCtx >>=
        loadAndApplyTemplate "templates/default.html" postCtx >>=
        relativizeUrls
    match "templates/*" $ compile templateBodyCompiler




--------------------------------------------------------------------------------

-- Config

config :: Configuration
config = defaultConfiguration {deployCommand = "./deploy.sh"}

-- Compiler

customPandocCompiler :: Compiler (Item String)
customPandocCompiler =
  let defaultWriterExtensions = writerExtensions defaultHakyllWriterOptions
      newWriterExtensions =
        enableExtension Ext_raw_attribute $ defaultWriterExtensions
      writerOptions =
        defaultHakyllWriterOptions {writerExtensions = newWriterExtensions}
  in pandocCompilerWith defaultHakyllReaderOptions writerOptions

-- Routing

slugRoute :: Routes
slugRoute =
  metadataRoute $ \md ->
    case (lookupString "slug" md) of
      Just slug -> customRoute $ slugSub slug . toFilePath
      Nothing -> idRoute
  where
    slugSub :: String -> FilePath -> FilePath
    slugSub slug path = (joinPath . init . splitPath) path </> slug

assetRoute :: Routes
assetRoute = customRoute assetPath
  where assetPath = (joinPath . tail . splitPath) . toFilePath

-- Contexts

postCtx :: Context String
postCtx = dateField "date" "%B %e, %Y" <> defaultContext

teaserCtx :: Context String
teaserCtx = teaserField "teaser" "content" <> postCtx

-- Archives

-- Groups post items by year (reverse order).
groupPosts :: [Item String] -> [(Int, [Item String])]
groupPosts = fmap merge . group . fmap tupelise
    where
        merge :: [(Int, [Item String])] -> (Int, [Item String])
        merge gs   = let conv (month, acc) (_, toAcc) = (month, toAcc ++ acc)
                     in  foldr conv (head gs) (tail gs)

        group ts   = groupBy (\(y, _) (y', _) -> y == y') ts
        tupelise i = let path = (toFilePath . itemIdentifier) i
                     in  case (postYear . takeBaseName) path of
                             Just year -> (year, [i])
                             Nothing   -> error $
                                              "[ERROR] wrong format: " ++ path

-- Extracts year from post file name.
postYear :: FilePath -> Maybe Int
postYear s = fmap read $ fmap head $ matchRegex articleRx s

articleRx :: Regex
articleRx = mkRegex "^([0-9]{4})\\-([0-9]{2})\\-([0-9]{2})(.+)$"

-- Pagination

makeId :: PageNumber -> Identifier
makeId pageNum = fromFilePath $
  if (pageNum == 1)
    then "index.html"
    else "index" ++ (show pageNum)  ++ ".html"

grouper :: MonadMetadata m => [Identifier] -> m [[Identifier]]
grouper = liftM (paginateEvery 5) . sortRecentFirst

paginate :: MonadMetadata m => Pattern -> m Paginate
paginate pattern = buildPaginateWith grouper pattern makeId

paginateContextPlus :: Paginate -> PageNumber -> Context a
paginateContextPlus pag currentPage = paginateContext pag currentPage <> mconcat
    [ listField "pagesBefore" linkCtx $ wrapPages pagesBefore
    , listField "pagesAfter"  linkCtx $ wrapPages pagesAfter
    ]
  where
      linkCtx :: Context (String, String)
      linkCtx = field "pageNum" (return . fst . itemBody) <>
                    field "pageUrl" (return . snd . itemBody)
      pages = [pageInfo n | n <- [1..lastPage], n /= currentPage]
      lastPage = M.size . paginateMap $ pag
      pageInfo n = (n, paginateMakeId pag n)
      (pagesBefore, pagesAfter) = span ((< currentPage) . fst) pages

wrapPages :: [(PageNumber, Identifier)] -> Compiler [Item (String, String)]
wrapPages = sequence . map makeInfoItem

makeInfoItem :: (PageNumber, Identifier) -> Compiler (Item (String, String))
makeInfoItem (n, i) = getRoute i >>= \mbR -> case mbR of
    Just r  -> makeItem (show n, toUrl r)
    Nothing -> fail $ "No URL for page: " ++ show n