set :stages, %w(staging production)
require 'capistrano/ext/multistage'

set :repository,  "git://github.com/mikesimons/CapistranoPresentation.git"

set :scm, :git
set :deploy_via, :remote_cache

set :use_sudo, false


## Setup tasks
after "deploy:setup", "mynamespace:setup_public_symlink"
after "deploy:setup", "mynamespace:setup_upload_dir"

namespace :mynamespace do
  task :setup_public_symlink, :roles => :app do
    run "mkdir -p #{web_root}/presentations"
    run "rm -f #{web_root}/presentations/capistrano"
    run "ln -s #{deploy_to}/current/public_html #{web_root}/presentations/capistrano"
  end

  task :setup_upload_dir, :roles => :app do
    run "mkdir -p #{shared_path}/uploads"
  end
end


## Per deploy tasks
before "deploy:symlink", "mynamespace:symlink_uploads"

namespace :mynamespace do
  task :symlink_uploads, :roles => :app do
    run "ln -s #{shared_path}/uploads #{release_path}/uploads"
  end
end


## Database migration tasks
before "deploy:symlink", "db:migrate:up"
after "deploy:rollback", "db:migrate:down"

namespace :db do
  namespace :migrate do
    task :up, :roles => :app do
      run "cd #{release_path} && DEPLOY_ENV=#{stage} rake db:migrate:up"
    end
    task :down, :roles => :app do
      run "cd #{release_path} && DEPLOY_ENV=#{stage} rake db:migrate:down"
    end
  end
end


