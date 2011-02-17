require 'active_record'
require 'logger'
require 'yaml'

namespace :db do
  namespace :migrate do
    desc "Migrate the database through scripts in db/migrate. Target specific version with VERSION=x"
    task :up => :environment do
      ActiveRecord::Migrator.up('db/migrate', ENV["VERSION"] ? ENV["VERSION"].to_i : nil )
    end

    desc "Migrate the database through scripts in db/migrate. Target specific version with VERSION=x"
    task :down => :environment do
      ActiveRecord::Migrator.down('db/migrate', ENV["VERSION"] ? ENV["VERSION"].to_i : nil )
    end
  end

  task :environment do
    deploy_env = ENV["DEPLOY_ENV"] || 'production'
    config = YAML::load(File.open('config/database.yml'))
    ActiveRecord::Base.establish_connection(config[deploy_env])
    ActiveRecord::Base.logger = Logger.new(File.open('/dev/null', 'w'))
  end
end
