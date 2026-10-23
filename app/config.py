from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, SecretStr, model_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    app_env: str = 'development'
    database_url: str = 'sqlite:///./legalgrowth.db'
    admin_password: SecretStr = SecretStr('')
    viewer_password: SecretStr = SecretStr('')
    scheduler_enabled: bool = False
    report_day: str = 'mon'
    report_hour: int = Field(9, ge=0, le=23)
    report_minute: int = Field(0, ge=0, le=59)
    timezone: str = 'America/Sao_Paulo'
    ai_provider: str = 'none'
    ai_api_key: SecretStr = SecretStr('')
    ai_max_tokens: int = Field(500, ge=1, le=2000)
    ai_monthly_limit_brl: float = Field(60, ge=0, le=200)
    ai_encryption_key: SecretStr = SecretStr('')
    ai_key_file: str = '.secrets/encryption.key'
    data_encryption_key: SecretStr = SecretStr('')
    data_key_file: str = '.secrets/client-data.key'

    @model_validator(mode='after')
    def secure_production(self):
        if self.app_env == 'production' and len(self.admin_password.get_secret_value()) < 20:
            raise ValueError('Produção exige senha administrativa com pelo menos 20 caracteres')
        return self


settings = Settings()
