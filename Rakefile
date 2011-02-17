require 'active_record'
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
    ActiveRecord::Base.establish_connection(YAML::load(File.open('config/database.yml')))
    ActiveRecord::Base.logger = Logger.new(File.open('/dev/null', 'w'))
  end
end
