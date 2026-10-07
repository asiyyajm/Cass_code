import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
/*

User object example:
{
    "id": 17,
    "name": "Elodie",
    "email": "elodie@union.edu",
    "is_teacher": false
}
*/

export const useLocalAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email) => {


    fetch("http://localhost:8000/api/users/?email=" + email)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
          const goTo =
            data.is_teacher
              ? "/instructors/homepage"
              : "/students/homepage";
          navigate(goTo, { replace: true });
        } else {
          alert("Incorrect email");
          console.error("User not found");
        }
      })
      .catch((err) => {
        alert("An error occurred while fetching user data");
        console.error("Error fetching user data:", err);
      });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return { user, login, logout, loading };
};
