class UserMailer < ApplicationMailer
  # Envia o código de verificação de e-mail para o cadastro manual.
  def verification_code(user, code)
    @code = code
    @ttl_minutes = (User::VERIFICATION_CODE_TTL / 60).to_i
    mail(
      to:      user.email,
      subject: "Seu código de verificação: #{code}"
    )
  end
end
