import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const handleAuth = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }
  return true;
};

export const handleGlobalSignOut = async (navigate) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.email) {
    Swal.fire({
      title: 'Error!',
      text: 'No user found to sign out',
      icon: 'error',
      confirmButtonColor: '#d33'
    });
    return;
  }

  try {
    // Show loading state
    Swal.fire({
      title: 'Signing out...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const response = await fetch(`${API_URL}api/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });

    if (response.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch a custom event to notify all components about the authentication change
      window.dispatchEvent(new CustomEvent('auth-change', { 
        detail: { status: 'signed-out' } 
      }));
      
      // Show success message
      await Swal.fire({
        title: 'Success!',
        text: 'You have been successfully signed out',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      navigate('/signin', { replace: true });
    } else {
      const data = await response.json();
      Swal.fire({
        title: 'Error!',
        text: `Signout failed: ${data.error}`,
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  } catch (error) {
    console.error('❌ Signout Error:', error);
    Swal.fire({
      title: 'Error!',
      text: 'Failed to sign out. Please try again.',
      icon: 'error',
      confirmButtonColor: '#d33'
    });
  }
};

// Confirmation dialog for sign out
export const confirmSignOut = async (navigate) => {
  const result = await Swal.fire({
    title: 'Sign Out',
    text: 'Are you sure you want to sign out?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, sign out!',
    cancelButtonText: 'Cancel'
  });

  if (result.isConfirmed) {
    await handleGlobalSignOut(navigate);
  }
};