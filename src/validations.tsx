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
    name.replace(/-/g, "").length
  ) {
    return true;
  }
  return false;
};

// username can be any nonblank character (for now) & must be at least 4 chars long
export const usernameIsValid = (username: string): boolean => {
  if (
    /^\S*$/.test(username) &&
    /[a-zA-Z]/.test(username) &&
    !username.includes("@") &&
    username.length >= 4
  ) {
    return true;
  }
  return false;
};

export const emailIsValid = (value: string): boolean =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    value.trim()
  );

export const passwordIsValid = (value: string): boolean =>
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,20}$/.test(value);
