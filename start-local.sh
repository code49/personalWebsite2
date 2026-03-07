# run this and the local development server should start (in theory)

rm -v *.log
bundle install

# open up the local build page in a browser
nohup /run/current-system/sw/bin/firefox -p dchan-personal -new-window http://127.0.0.1:4000 &!

# bundle exec jekyll serve --host 127.0.1 --port 4000 --trace --verbose | tee serve.log
bundle exec jekyll serve --host 127.0.1 --port 4000 --livereload | tee serve.log


