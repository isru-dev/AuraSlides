import { useEffect, useState } from "react"

export  function Profile() {
  const [user,setuser]=useState(null);

  useEffect(()=>{
    const token = localStorage.getItem("userToken");
     fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`,{
      headers: {
        Authorization: `Bearer ${token}`,
    }
  })
     .then((res)=>res.json())
     .then((data)=>{
        if (data.success) {
          setUser(data.user);
        } else {
          console.error("Failed to fetch user:", data.message);
        }
      })
      .catch((err) => {
        console.error("User fetch error:", err);
      })
     
    },[]);
   return(
    <div className="flex items-center justify-center ">
      <div>
        profile
      </div>
      <div>
        {user?.name}
      </div>
    </div>
   )
}