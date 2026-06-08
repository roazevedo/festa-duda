class CreateMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :messages do |t|
      t.references :event, null: false, foreign_key: true
      t.string :name
      t.text :body

      t.timestamps
    end
  end
end
