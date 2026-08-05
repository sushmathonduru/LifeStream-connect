import { useState, useEffect } from "react"
import { db } from "../firebase/config"
import { ref, onValue } from "firebase/database"
import { Search, MapPin, Phone, User } from "lucide-react"

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function FindDonor() {
  const [searchCity, setSearchCity] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("All")
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const usersRef = ref(db, "users")
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const donorList = Object.entries(data)
          .map(function ([id, user]) {
            return { id: id, ...user }
          })
          .filter(function (u) {
            return u.isDonor === true
          })
        setDonors(donorList)
      } else {
        setDonors([])
      }
      setLoading(false)
    })
    return function () {
      unsubscribe()
    }
  }, [])

  const filteredDonors = donors.filter(function (donor) {
    const matchGroup =
      selectedGroup === "All" || donor.bloodGroup === selectedGroup
    const matchCity =
      searchCity === "" ||
      (donor.city &&
        donor.city.toLowerCase().includes(searchCity.toLowerCase()))
    return matchGroup && matchCity
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-red-600 to-red-800 px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-white text-2xl font-bold">Find Donor</h1>
          <p className="text-red-100 mt-1 text-sm">Search nearby blood donors</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-5 top-4 text-gray-400" size={18} />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search by city..."
            className="w-full border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-base focus:outline-none focus:border-red-400 bg-white shadow-sm"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto py-1">
          {bloodGroups.map(function (group) {
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={
                  "flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all " +
                  (selectedGroup === group
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-600 border-gray-200")
                }
              >
                {group}
              </button>
            )
          })}
        </div>

        <p className="text-sm text-gray-500 font-medium">
          {filteredDonors.length} donor{filteredDonors.length !== 1 ? "s" : ""} found
        </p>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && filteredDonors.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">No donors found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchCity || selectedGroup !== "All"
                ? "Try different filters"
                : "No donors registered yet. Sign up as a donor!"}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && filteredDonors.map(function (donor) {
            return (
              <div
                key={donor.id}
                className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold text-base">
                    {donor.bloodGroup}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-800">
                    {donor.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {donor.city}
                  </p>
                  <span className={
                    "text-xs font-medium mt-1 inline-block " +
                    (donor.available ? "text-green-600" : "text-gray-400")
                  }>
                    {donor.available ? "● Available" : "● Unavailable"}
                  </span>
                </div>
                {donor.available && donor.phone && (
                  <a href={"tel:" + donor.phone}
                    className="bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2">
                    📞 Call
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
