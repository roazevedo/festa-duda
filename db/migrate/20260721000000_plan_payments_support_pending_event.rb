class PlanPaymentsSupportPendingEvent < ActiveRecord::Migration[7.2]
  def change
    # Evento pago é criado só após a aprovação — até lá o pagamento
    # existe sem evento, guardando os dados do evento a criar.
    change_column_null :plan_payments, :event_id, true
    add_reference :plan_payments, :user, foreign_key: true, null: true

    add_column :plan_payments, :event_type, :string
    add_column :plan_payments, :event_name, :string
    add_column :plan_payments, :event_date, :datetime
  end
end
