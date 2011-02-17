class CreateTestTable < ActiveRecord::Migration
  def self.up
    create_table :test do |t|
      t.column :id, :integer
      t.column :name, :string
    end
  end
  def self.down
    drop_table :test
  end
end
