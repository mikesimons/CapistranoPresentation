set :repository,  "git@github.com:mikesimons/CapistranoPresentation.git"

set :scm, :git
set :deploy_via, :remote_cache
set :git_enable_submodules, 1
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`

role :web, "iammike.co.uk"                          # Your HTTP server, Apache/etc
role :app, "iammike.co.uk"                          # Your HTTP server, Apache/etc
role :db,  "iammike.co.uk", :primary => true # This is where Rails migrations will run

set :user, "iammike"
set :use_sudo, false
set :deploy_to, "/home/iammike/presentations/capistrano"
set :web_root, "/home/iammike/public_html" # Custom variable

after "deploy:setup", "mynamespace:setup_public_symlink"
after "deploy:setup", "mynamespace:setup_upload_dir"

before "deploy:symlink", "mynamespace:symlink_uploads"
before "deploy:symlink", "db:migrate:up"

after "deploy:rollback", "db:migrate:down"

namespace :db do
  namespace :migrate do
    task :up, :roles => :app do
      run "rake db:migrate:up"
    end
    task :down, :roles => :app do
      run "rake db:migrate:down"
    end
  end
end

namespace :mynamespace do
  task :setup_public_symlink, :roles => :app do
    run "mkdir -p #{web_root}/presentations"
    run "rm -f #{web_root}/presentations/capistrano"
    run "ln -s #{deploy_to}/current/public_html #{web_root}/presentations/capistrano"
  end

  task :setup_upload_dir, :roles => :app do
    run "mkdir -p #{shared_path}/uploads"
  end

  task :symlink_uploads, :roles => :app do
    run "ln -s #{shared_path}/uploads #{release_path}/uploads"
  end
end
