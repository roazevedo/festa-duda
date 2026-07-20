class AddPlanToEvents < ActiveRecord::Migration[7.2]
  def up
    add_column :events, :plan, :string, null: false, default: "gratis"

    # O template teatro é o site feito sob medida da Maria Eduarda —
    # exatamente o que o plano Ateliê oferece
    execute <<~SQL
      UPDATE events SET plan = 'atelie' WHERE settings->>'template' = 'teatro'
    SQL
  end

  def down
    remove_column :events, :plan
  end
end
