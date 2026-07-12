import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getEmployees, getDepartments } from "./api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, depts] = await Promise.all([getEmployees(), getDepartments()]);
      setEmployees(emps);
      setDepartments(depts);
      if (!currentEmployeeId && emps.length) {
        setCurrentEmployeeId(emps[0].id);
      }
    } catch (e) {
      // swallow - individual pages surface their own errors
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentEmployee = employees.find((e) => e.id === Number(currentEmployeeId));

  return (
    <AppContext.Provider
      value={{
        employees,
        departments,
        currentEmployeeId,
        setCurrentEmployeeId,
        currentEmployee,
        loading,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
