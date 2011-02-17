# STAGING-specific deployment configuration
# please put general deployment config in config/deploy.rb
#
role :web, "localhost"                          # Your HTTP server, Apache/etc
role :app, "localhost"                          # Your HTTP server, Apache/etc
role :db,  "localhost", :primary => true # This is where Rails migrations will run

set :user, "mike"
set :deploy_to, "/tmp/fakestaging/capistrano"
set :web_root, "/tmp/fakestaging/webroot" # Custom variable
