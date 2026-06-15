class SecurityHeadersMiddleware
  HEADERS = {
    "X-Frame-Options"         => "SAMEORIGIN",
    "X-Content-Type-Options"  => "nosniff",
    "X-XSS-Protection"        => "1; mode=block",
    "Referrer-Policy"         => "strict-origin-when-cross-origin",
    "Content-Security-Policy" => "default-src 'self'; img-src 'self' res.cloudinary.com data:; " \
                                  "script-src 'self'; style-src 'self' 'unsafe-inline'; " \
                                  "font-src 'self' fonts.gstatic.com;"
  }.freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, body = @app.call(env)
    HEADERS.each { |key, value| headers[key] ||= value }
    [ status, headers, body ]
  end
end
