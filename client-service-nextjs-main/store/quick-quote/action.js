import { getQuickQuoteApi, getPublicQuickQuoteApi } from "./api";

export const getQuickQuoteAction = async ({ body, signal }) => {
  return await getQuickQuoteApi(body, signal);
};

export const getPublicQuickQuoteAction = async ({body, signal }) => {
  return await getPublicQuickQuoteApi(body, signal);
};
