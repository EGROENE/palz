export const nameIsValid = (name: string): boolean => {
  if (
    /^[a-zA-ZÄäÖöÜüßÉéÍíóÓÑñ -.]*$/i.test(name) &&
    name.replace(/\s/g, "").length &&
    name.replace(/\./g, "").length &&
    name.replace(/'/g, "").length &&
    name.replace(/\^/g, "").length &&
    name.replace(/%/g, "").length &&
    name.replace(/\*/g, "").length &&
    name.replace(/\(/g, "").length &&
    name.replace(/\)/g, "").length &&
    name.replace(/!/g, "").length &&
    name.replace(/@/g, "").length &&
    name.replace(/-/g, "").length &&
    name.replace(/\$/g, "").length &&
    name.replace(/&/g, "").length
  ) {
    return true;
  }
  return false;
};

// username must consist of only alphanumeric characters & must be 4-20 chars long
export const usernameIsValid = (username: string): boolean => {
  if (/^[A-Za-z0-9]*$/.test(username)) {
    return true;
  }
  return false;
};

export const emailIsValid = (value: string): boolean =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    value.trim()
  );

export const passwordIsValid = (value: string | undefined): boolean => {
  if (value) {
    if (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,50}$/.test(value)) {
      return true;
    }
  }
  return false;
};
