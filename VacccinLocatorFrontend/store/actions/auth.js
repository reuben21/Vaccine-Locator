import AsyncStorage from "@react-native-async-storage/async-storage";

// export const SIGNUP = 'SIGNUP';
// export const LOGIN = 'LOGIN';
export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT = "LOGOUT";

let timer;

export const authenticate = (userId, token, expiryTime) => {
  return dispatch => {
    dispatch(setLogoutTimer(expiryTime));
    dispatch({ type: AUTHENTICATE, userId: userId, token: token });
  };
};

export const signup = (firstName, lastName, email, password, phoneNo, aadharCardNo) => {
  return async dispatch => {
    const response = await fetch("http://10.0.2.2:4000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "firstName": firstName,
          "lastName": lastName,
          "email": email,
          "password": password,
          "phoneNo": phoneNo,
          "aadharNo": aadharCardNo,

        }),
      },
    );


    const resData = await response.json();
    console.log(resData.errorMessage);
    if (resData.errorMessage !== undefined) {
      return resData.errorMessage
    }
    console.log(resData);
    dispatch(
      authenticate(
        resData.token,
        resData._id,
        parseInt(10) * 1000,
      ),
    );
    const expirationDate = new Date(
      new Date().getTime() + parseInt(10) * 1000,
    );
    saveDataToStorage(resData.token, resData._id, expirationDate);
  };
};

export const login = (email, password) => {
  return async dispatch => {
    const response = await fetch(
      "http://10.0.2.2:4000/users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      },
    );

    // if (!response.ok) {
    //   const errorResData = await response.json();
    //   const errorId = errorResData.error.message;
    //   let message = "Something went wrong!";
    //   if (errorId === "EMAIL_NOT_FOUND") {
    //     message = "This email could not be found!";
    //   } else if (errorId === "INVALID_PASSWORD") {
    //     message = "This password is not valid!";
    //   }
    //   throw new Error(message);
    // }

    const resData = await response.json();
    console.log(resData);
    dispatch(
      authenticate(
        resData.localId,
        resData.idToken,
        parseInt(10) * 1000,
      ),
    );
    const expirationDate = new Date(
      new Date().getTime() + parseInt(10) * 1000,
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
};

export const logout = () => {
  clearLogoutTimer();
  AsyncStorage.removeItem("userData");
  return { type: LOGOUT };
};

const clearLogoutTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
};

const setLogoutTimer = expirationTime => {
  return dispatch => {
    timer = setTimeout(() => {
      dispatch(logout());
    }, expirationTime);
  };
};

const saveDataToStorage = (token, userId, expirationDate) => {
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({
      token: token,
      userId: userId,
      expiryDate: expirationDate.toISOString(),
    }),
  );
};
