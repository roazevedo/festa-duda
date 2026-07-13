class AddPositionToPhotos < ActiveRecord::Migration[7.2]
  def up
    add_column :photos, :position, :integer
    add_index  :photos, [ :event_id, :category, :position ]

    # Backfill: preserva a ordem atual (criação) por evento+categoria
    execute <<~SQL
      UPDATE photos SET position = sub.rn - 1
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY event_id, category
                 ORDER BY created_at ASC, id ASC
               ) AS rn
        FROM photos
      ) sub
      WHERE photos.id = sub.id
    SQL
  end

  def down
    remove_index  :photos, [ :event_id, :category, :position ]
    remove_column :photos, :position
  end
end
