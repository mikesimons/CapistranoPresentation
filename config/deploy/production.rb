# PRODUCTION-specific deployment configuration
# please put general deployment config in config/deploy.rb
#
role :web, "iammike.co.uk"                          # Your HTTP server, Apache/etc
role :app, "iammike.co.uk"                          # Your HTTP server, Apache/etc
role :db,  "iammike.co.uk", :primary => true # This is where Rails migrations will run

set :user, "iammike"
set :deploy_to, "/home/iammike/presentations/capistrano"
set :web_root, "/home/iammike/public_html" # Custom variable
