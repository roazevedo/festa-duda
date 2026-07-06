class AddCompanionNamesToRsvps < ActiveRecord::Migration[7.2]
  def change
    add_column :rsvps, :companion_names, :jsonb, default: []
  end
end
