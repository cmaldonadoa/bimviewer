import Swal from "sweetalert2";

export default {
  toastSuccess: (title) =>
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "success",
      title: title,
      showConfirmButton: false,
      timer: 2000,
    }),

  toastInfo: (title) =>
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "info",
      title: title,
      showConfirmButton: false,
    }),

  toastError: (title) =>
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "error",
      title: title,
      showConfirmButton: false,
      timer: 2000,
    }),

  alertError: (title, message) =>
    Swal.fire({
      icon: "error",
      title: title,
      text: message,
      showConfirmButton: false,
    }),

  alertWarning: (title, message, config) =>
    Swal.fire({
      icon: "warning",
      title: title,
      html: message,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: config.okText,      
      reverseButtons: true,
      focusConfirm: false,
      customClass: {
        confirmButton: "MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedSecondary MuiButton-disableElevation",
        cancelButton: "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-colorInherit MuiButton-disableElevation"
      }
    }),
};
