class AddEmailVerificationToUsers < ActiveRecord::Migration[7.2]
  def up
    add_column :users, :email_verified_at, :datetime
    add_column :users, :verification_code_digest, :string
    add_column :users, :verification_code_sent_at, :datetime

    # Contas que já existiam (e as criadas via Google) são consideradas
    # verificadas — a verificação por código passa a valer só para
    # cadastros manuais NOVOS. Assim ninguém é trancado fora.
    execute <<~SQL.squish
      UPDATE users SET email_verified_at = COALESCE(created_at, CURRENT_TIMESTAMP)
    SQL
  end

  def down
    remove_column :users, :email_verified_at
    remove_column :users, :verification_code_digest
    remove_column :users, :verification_code_sent_at
  end
end
