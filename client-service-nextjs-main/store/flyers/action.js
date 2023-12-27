import {
  generateFlyersAPI,
  fetchAllFlyersAPI,
  downloadFlyerAPI,
  generateFlyersWithColorsAPI,
  fetchFlyerImagesAPI,
} from "./api";
import config from "~/config";
import qrcode from "qrcode";
import { FLYERS } from "./type";
import { onHandleError } from "~/error/onHandleError";
import dayjs from "dayjs";

export const resetFlyerTemplatesAction = (dispatch) => {
  dispatch({
    type: FLYERS.GET_ALL_FLYER_TEMPLATES,
    payload: {
      loading: false,
      list: {},
      page: 1,
      limit: 10,
    },
  });
};

export const getFlyerTemplatesAction = ({ page, limit, type }) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      flyers: { listOfFlyerTemplates },
    } = getState();

    try {
      dispatch({
        type: FLYERS.GET_ALL_FLYER_TEMPLATES,
        payload: {
          loading: true,
          list:
            Object.keys(listOfFlyerTemplates.list).length > 0
              ? listOfFlyerTemplates.list
              : {},
          page,
          limit,
        },
      });

      const response = await fetchFlyerImagesAPI(page, limit, type, signal);

      if (response.status === 200) {
        const newData = {
          ...response.data.flyers,
          data:
            response.data.flyers.data.length > 0
              ? response.data.flyers.data.map((item) => {
                  return {
                    ...item,
                    key: item.id,
                    image: `${config.storagePath}${item.image}`,
                    pdfUrl: `${config.storagePath}${item.pdf_name}`,
                  };
                })
              : response.data.flyers.data,
        };

        dispatch({
          type: FLYERS.GET_ALL_FLYER_TEMPLATES,
          payload: {
            loading: false,
            list: newData,
            page: newData.current_page,
            limit: newData.per_page,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      resetFlyerTemplatesAction(dispatch);
    } finally {
      controller.abort();
    }
  };
};

/**
 * Generate flyers through PDF co
 * @param {String} selectedImage
 * @param {Number} flyerId
 * @param {String} listingLinkUrl
 * @param {Number} selectedListingId
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const generateFlyersAction = async (
  selectedImage,
  flyerId,
  listingLinkUrl,
  selectedListingId,
  signal
) => {
  const qrCodeImage = await qrcode.toDataURL(listingLinkUrl);
  const body = {
    flyer_id: flyerId,
    url: selectedImage,
    searchStrings: [
      "NAME LASTNAME",
      "NAMELAST@WEBSITE.COM",
      "123.456.7890",
      "NMLS# 1234567",
      "1st_line",
      "2nd_line",
      "3rd_line",
      "4th_line",
      "ADDRESS GOES HERE",
      "dp",
      "TITLE GOES HERE",
      "listingdown",
      "PRICE_HERE",
    ],
    // for the logo image
    searchString: "logo_here",

    // for the qr image
    searchQrString: "qr_here",
    replaceQrImage: qrCodeImage,
    searchSmlLogoString: "sml_logo",
    listing_id: selectedListingId,
  };

  return await generateFlyersAPI(body, signal);
};

/**
 * Generate flyers by converting PDF to html and vice versa
 * @param {Number} flyerId
 *  @param {Number} stateId
 * @param {Number} selectedListingId
 * @param {String} pdfflyerName
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const generateFlyerWithColorsAction = async (
  flyerId,
  pdfflyerName,
  signal,
  source,
  listingLinkUrl = null,
  selectedListingId = null,
  state_id
) => {
  const body = {
    flyer_id: flyerId,
    template: pdfflyerName,
    state_id: state_id,
  };

  if (listingLinkUrl && selectedListingId) {
    const qrCodeImage = await qrcode.toDataURL(listingLinkUrl);
    body.qr_image = qrCodeImage;
    body.listing_id = selectedListingId;
  }
  return await generateFlyersWithColorsAPI(source, body, signal);
};

/**
 * View all the flyers
 * @param {Object} flyers
 * @returns {void}
 */

export const viewAllFlyers = (flyers) => {
  return async (dispatch, getState) => {
    const { flyers: stateFlyers } = getState();
    const controller = new AbortController();
    const { signal } = controller;
    dispatch({
      type: FLYERS.GET_ALL_FLYERS,
      payload: {
        ...stateFlyers.listOfFlyers,
        loading: true,
        page: flyers.page,
        limit: flyers.limit,
        sortBy: flyers.sortBy,
        search: flyers.search,
        addressSearch: flyers.addressSearch,
        activeArchive: flyers.activeArchive,
        created_by: flyers.created_by,
        companyId: flyers.companyId,
      },
    });

    try {
      const response = await fetchAllFlyersAPI(flyers, signal);

      if (response.status === 200) {
        dispatch({
          type: FLYERS.GET_ALL_FLYERS,
          payload: {
            ...stateFlyers.listOfFlyers,
            loading: false,
            data: {
              ...response.data,
              data:
                response.data.data.length > 0
                  ? response.data.data.map((item) => {
                      return {
                        ...item,
                        key: item.generated_flyer_id,
                        address: item.full_address,
                        pdf_link: `${config.storagePath}${item.generated_flyer}`,
                        createdBy: `${item.user_first_name} ${item.user_last_name}`,
                        created_at: dayjs(
                          item.generated_flyer_created_at
                        ).format("MMM DD, YYYY"),
                      };
                    })
                  : [],
            },
            page: flyers.page,
            limit: flyers.limit,
            sortBy: flyers.sortBy,
            search: flyers.search,
            addressSearch: flyers.addressSearch,
            activeArchive: flyers.activeArchive,
            created_by: flyers.created_by,
            companyId: flyers.companyId,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};

/**
 * Download flyer action
 * @param {string} fileName
 * @param {string} flyerId
 * @param {object} flyersDownload
 * @param {function} setFlyersDownload
 * @param {AbortSignal} signal
 * @returns {download file}
 */
export const downloadFlyerAction = ({
  fileName,
  flyerId,
  flyersDownload,
  setFlyersDownload,
  signal,
}) => {
  return async (dispatch) => {
    try {
      const response = await downloadFlyerAPI(
        flyerId,
        flyersDownload,
        setFlyersDownload,
        signal
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], {
            type: "octet-stream",
          }),
          href = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), {
          href,
          style: "display: none",
          download: `${fileName}`,
        });

        setTimeout(() => {
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(href);
          document.body.removeChild(a);
          setFlyersDownload({
            ...flyersDownload,
            open: false,
            progress: 0,
            onRequested: false,
          });
        }, 1000);
      }
    } catch (error) {
      onHandleError(error, dispatch);
      setFlyersDownload({
        ...flyersDownload,
        open: false,
        progress: 0,
        onRequested: false,
      });
    }
  };
};

export const handleListingFlyerModal = (payload) => {
  return (dispatch) => {
    dispatch({
      type: FLYERS.LISTING_FLYERS_MODAL,
      payload,
    });
  };
};
