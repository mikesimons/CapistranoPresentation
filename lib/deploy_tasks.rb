
Capistrano::Configuration.instance.load do
  ## Setup tasks
  namespace :mynamespace do
    desc "[internal] Create symlink under doc root"
    task :setup_public_symlink, :roles => :app do
      run "mkdir -p #{web_root}/presentations"
      run "rm -f #{web_root}/presentations/capistrano"
      run "ln -s #{deploy_to}/current/public_html #{web_root}/presentations/capistrano"
    end

    desc "[internal] Create upload dir in shared folder"
    task :setup_upload_dir, :roles => :app do
      run "mkdir -p #{shared_path}/uploads"
    end
  end

  ## Per deploy tasks
  namespace :mynamespace do
    desc "[internal] Symlink shared uploads to current release"
    task :symlink_uploads, :roles => :app do
      run "ln -s #{shared_path}/uploads #{release_path}/uploads"
    end
  end

  ## DB migration tasks
  namespace :db do
    namespace :migration do
      desc "Migrate database up"
      task :up, :roles => :app do
        run "cd #{release_path} && DEPLOY_ENV=#{stage} rake db:migration:up"
      end

      desc "Migrate database down"
      task :down, :roles => :app do
        run "cd #{release_path} && DEPLOY_ENV=#{stage} rake db:migration:down"
      end
    end
  end
end
