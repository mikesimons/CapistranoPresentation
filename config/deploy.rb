set :stages, %w(staging production)
require 'capistrano/ext/multistage'

set :repository,  "git://github.com/mikesimons/CapistranoPresentation.git"

set :scm, :git
set :deploy_via, :remote_cache

set :use_sudo, false

## Setup tasks
after "deploy:setup", "mynamespace:setup_public_symlink"
after "deploy:setup", "mynamespace:setup_upload_dir"

## Per deploy tasks
before "deploy:symlink", "mynamespace:symlink_uploads"

## Database migration tasks
before "deploy:symlink", "db:migration:up"
after "deploy:rollback", "db:migration:down"

## Cleanup
after "deploy:finalize_update", "deploy:cleanup"
