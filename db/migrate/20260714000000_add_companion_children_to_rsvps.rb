class AddCompanionChildrenToRsvps < ActiveRecord::Migration[7.1]
  def change
    # Booleans alinhados por índice com companion_names:
    # true = acompanhante é criança abaixo de 8 anos
    add_column :rsvps, :companion_children, :jsonb, default: []
  end
end
