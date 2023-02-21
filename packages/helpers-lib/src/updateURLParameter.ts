/**
 * Updates the value of a URL parameter and returns the updated URL.
 * @param url The URL to update.
 * @param param The name of the parameter to update.
 * @param paramVal The new value for the parameter.
 * @returns The updated URL with the new parameter value.
 * @see http://stackoverflow.com/a/10997390/11236
*/
const updateURLParameter = (url: string, param: string, paramVal: string): string => {
  let newAdditionalURL = "";
  let tempArray = url.split("?");
  const baseURL = tempArray[0];
  const additionalURL = tempArray[1];
  let temp = "";
  if (additionalURL) {
    tempArray = additionalURL.split("&");
    for (let i = 0; i < tempArray.length; i++) {
      if (tempArray[i].split("=")[0] != param) {
        newAdditionalURL += temp + tempArray[i];
        temp = "&";
      }
    }
  }

  const rowsTxt = temp + "" + param + "=" + paramVal;
  return baseURL + "?" + newAdditionalURL + rowsTxt;
};

export default updateURLParameter;
