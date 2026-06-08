class CreateEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :events do |t|
      t.references :user, null: false, foreign_key: true
      t.string :slug
      t.string :name
      t.string :event_type
      t.datetime :event_date
      t.string :venue_name
      t.string :venue_address
      t.string :token
      t.jsonb :settings

      t.timestamps
    end
  end
end
