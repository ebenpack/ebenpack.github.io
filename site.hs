--------------------------------------------------------------------------------
{-# LANGUAGE OverloadedStrings #-}

import Control.Monad (forM, liftM)
import Data.List (groupBy, sortBy)
import qualified Data.Map as M
import Data.Monoid ((<>))
import Data.Ord (comparing)
import Data.Time.Calendar (toGregorian)
import Data.Time.Clock (UTCTime, utctDay)
import Data.Time.Format
import Hakyll
import System.FilePath
import Text.Pandoc.Options

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
        customPandocCompiler >>= saveSnapshot "content" >>=
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
        projects <- loadAll "pages/projects/*" >>= sortChronologicalItems
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
        posts <- loadAll "posts/*" >>= groupChronologicalItems
        let archiveCtx =
              listField
                "dates"
                (field
                   "date"
                   (return .
                    formatTime defaultTimeLocale "%B %0Y" . fst . itemBody) <>
                 listFieldWith "posts" teaserCtx (return . snd . itemBody))
                (traverse (\(d, is) -> makeItem (d, is)) posts) <>
              constField "title" "Archives" <>
              defaultContext
        makeItem "" >>=
          loadAndApplyTemplate "templates/archives.html" archiveCtx >>=
          loadAndApplyTemplate "templates/default.html" archiveCtx >>=
          relativizeUrls
    page <- paginate "posts/*"
    paginateRules page $ \pageNum pattern' -> do
      route idRoute
      compile $ do
        posts <- recentFirst =<< loadAllSnapshots pattern' "content"
        let paginateCtx = paginateContext page pageNum
            indexCtx =
              listField "posts" teaserCtx (return posts) <>
              constField "title" "Home" <>
              paginateContextPlus page pageNum <>
              defaultContext
        makeItem "" >>= loadAndApplyTemplate "templates/index.html" indexCtx >>=
          loadAndApplyTemplate "templates/default.html" indexCtx >>=
          relativizeUrls
    match "templates/404.html" $ do
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
        enableExtension Ext_raw_attribute defaultWriterExtensions
      writerOptions =
        defaultHakyllWriterOptions {writerExtensions = newWriterExtensions}
  in pandocCompilerWith defaultHakyllReaderOptions writerOptions

-- Routing
slugRoute :: Routes
slugRoute = metadataRoute makeRoute
  where
    makeRoute :: Metadata -> Routes
    makeRoute md =
      case lookupString "slug" md of
        Just slug -> customRoute $ slugSub slug . toFilePath
        Nothing -> idRoute
    slugSub :: String -> FilePath -> FilePath
    slugSub slug path = (joinPath . init . splitPath) path </> slug

assetRoute :: Routes
assetRoute = customRoute assetPath
  where
    assetPath :: Identifier -> FilePath
    assetPath = (joinPath . tail . splitPath) . toFilePath

-- Contexts
postCtx :: Context String
postCtx = dateField "date" "%B %e, %Y" <> defaultContext

teaserCtx :: Context String
teaserCtx = teaserField "teaser" "content" <> postCtx

-- Archives
groupChronologicalItems :: [Item a] -> Compiler [(UTCTime, [Item a])]
groupChronologicalItems items = do
  withTime <-
    forM items $ \item -> do
      utc <- getItemUTC defaultTimeLocale $ itemIdentifier item
      return (utc, [item])
  return $
    fmap merge $ groupBy compareTime $ sortBy (flip (comparing fst)) withTime
  where
    merge :: [(UTCTime, [Item a])] -> (UTCTime, [Item a])
    merge groups =
      let conv (date, acc) (_, toAcc) = (date, toAcc ++ acc)
      in foldr conv (head groups) (tail groups)
    compareTime :: (UTCTime, a) -> (UTCTime, b) -> Bool
    compareTime (t1, _) (t2, _) =
      let (year1, month1, _) = toGregorian $ utctDay t1
          (year2, month2, _) = toGregorian $ utctDay t2
      in year1 == year2 && month1 == month2

sortChronologicalItems :: [Item a] -> Compiler [Item a]
sortChronologicalItems items = do
  withTime <-
    forM items $ \item -> do
      utc <- getItemUTC defaultTimeLocale $ itemIdentifier item
      return (utc, item)
  return $ map snd $ sortBy (flip (comparing fst)) withTime

-- Pagination
makeId :: PageNumber -> Identifier
makeId pageNum =
  fromFilePath $
  if pageNum == 1
    then "index.html"
    else "index" ++ show pageNum ++ ".html"

grouper :: MonadMetadata m => [Identifier] -> m [[Identifier]]
grouper = fmap (paginateEvery 5) . sortRecentFirst

paginate :: MonadMetadata m => Pattern -> m Paginate
paginate pattern' = buildPaginateWith grouper pattern' makeId

paginateContextPlus :: Paginate -> PageNumber -> Context a
paginateContextPlus page currentPage =
  paginateContext page currentPage <>
  mconcat
    [ listField "pagesBefore" linkCtx $ wrapPages pagesBefore
    , listField "pagesAfter" linkCtx $ wrapPages pagesAfter
    ]
  where
    linkCtx :: Context (String, String)
    linkCtx =
      field "pageNum" (return . fst . itemBody) <>
      field "pageUrl" (return . snd . itemBody)
    pages :: [(Int, Identifier)]
    pages = [pageInfo n | n <- [1 .. lastPage], n /= currentPage]
    lastPage :: Int
    lastPage = M.size . paginateMap $ page
    pageInfo :: Int -> (Int, Identifier)
    pageInfo n = (n, paginateMakeId page n)
    (pagesBefore, pagesAfter) =
      span ((< currentPage) . fst) pages :: ( [(PageNumber, Identifier)]
                                            , [(PageNumber, Identifier)])

wrapPages :: [(PageNumber, Identifier)] -> Compiler [Item (String, String)]
wrapPages = mapM makeInfoItem

makeInfoItem :: (PageNumber, Identifier) -> Compiler (Item (String, String))
makeInfoItem (n, i) = getRoute i >>= makeInfo
  where
    makeInfo :: Maybe FilePath -> Compiler (Item (String, String))
    makeInfo filepath =
      case filepath of
        Just p -> makeItem (show n, toUrl p)
        Nothing -> fail $ "No URL for page: " ++ show n
