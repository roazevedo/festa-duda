class AddVisibilityFieldsToEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :events, :rsvp_list_public, :boolean, default: false, null: false
    add_column :events, :messages_public,  :boolean, default: true,  null: false
  end
end
