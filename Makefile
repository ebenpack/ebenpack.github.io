.PHONY : clean
clean:
	rm -r public
	rm -r static/js/bundle
	rm -r js/dist

.PHONY : build
build:
	yarn --cwd js install
	yarn --cwd js build:prod
	cp -r js/dist static/js/bundle
	zola build

.PHONY : deploy
deploy : clean build
	git -C public/ init
	git -C public/ config remote.origin.url >&- || git -C public/ remote add origin $(git ls-remote --get-url origin)
	git -C public/ fetch
	git -C public/ checkout master || git -C public/ checkout --orphan master
	git -C public/ add .
	git -C public/ commit -m "Publish - $(date "+%Y-%m-%d %H:%M:%S")"
	# git -C public/ push --set-upstream origin master

