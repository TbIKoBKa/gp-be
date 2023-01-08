import { CurrencyType } from "../common/types";
import { LanguageType } from "../common/types/language";

export const getLanguageByCurrency = (currency: CurrencyType) => {
  switch (currency) {
    case CurrencyType.UAH:
      return LanguageType.UK;
    case CurrencyType.RUB:
      return LanguageType.RU;
    case CurrencyType.USD:
      return LanguageType.EN;
    default:
      return LanguageType.EN;
  }
};
