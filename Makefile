.PHONY : clean
clean:
	rm -rf public/
	rm -rf static/js/bundle
	rm -rf js/dist
	rm -rf js/node_modules
	rm -rf _publish_dir/

.PHONY : update-lockfile
update-lockfile:
	yarn --cwd js upgrade

.PHONY : build
build:
	yarn --cwd js install --check-files --force
	yarn --cwd js build:prod
	cp -r js/dist static/js/bundle
	mkdir -p templates
	zola build

.PHONY : deploy
deploy : clean build
	$(eval current_git_url := $(shell git ls-remote --get-url origin))
	mkdir -p _publish_dir
	git -C _publish_dir/ init
	git -C _publish_dir/ config remote.origin.url >&- || git -C _publish_dir/ remote add origin ${current_git_url}
	git -C _publish_dir/ fetch
	git -C _publish_dir/ checkout master || git -C _publish_dir/ checkout --orphan master
	# Delete everything (except dotfiles, e.g. .git), so we don't end up w/ cruft hanging around
	rm -rf _publish_dir/*
	cp -Rn public/ _publish_dir/
	echo "ebenpackwood.com" > _publish_dir/CNAME
	git -C _publish_dir/ add .
	git -C _publish_dir/ commit -m "Publish - $(shell date "+%Y-%m-%d %H:%M:%S")"
	git -C _publish_dir/ push

