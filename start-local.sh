# run this and the local development server should start (in theory)
rm -v *.log
bundle install
# bundle exec jekyll serve --host 127.0.1 --port 4000 --trace --verbose | tee serve.log
bundle exec jekyll serve --host 127.0.1 --port 4000 --livereload | tee serve.log
