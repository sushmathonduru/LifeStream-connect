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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Title Card */}
        <div className="bg-red-600 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xs text-white border border-white/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
              🔍
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Find Donors</h1>
              <p className="text-red-100 text-xs font-medium mt-0.5">
                Search nearby verified blood donors by city and blood type
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Control Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              placeholder="Search by city (e.g. Chicago, New York)..."
              className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 bg-slate-50/50 transition-all"
            />
          </div>

          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Filter by Blood Group</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {bloodGroups.map(function (group) {
                const active = selectedGroup === group
                return (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={
                      "shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all " +
                      (active
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80")
                    }
                  >
                    {group}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {filteredDonors.length} {filteredDonors.length === 1 ? "donor" : "donors"} found
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && filteredDonors.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <User className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-800 font-bold text-base">No Donors Found</p>
            <p className="text-slate-400 text-xs mt-1">
              {searchCity || selectedGroup !== "All"
                ? "Try adjusting your city search or blood group filter."
                : "No registered donors available at this moment."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && filteredDonors.map(function (donor) {
            return (
              <div
                key={donor.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl flex items-center justify-center text-lg font-black shrink-0">
                    {donor.bloodGroup}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{donor.name}</h3>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin size={13} className="text-slate-400" />
                      <span>{donor.city || "City unspecified"}</span>
                    </p>
                    <span className={
                      "text-[11px] font-bold mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full " +
                      (donor.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")
                    }>
                      <span className={donor.available ? "w-1.5 h-1.5 rounded-full bg-emerald-500" : "w-1.5 h-1.5 rounded-full bg-slate-400"} />
                      {donor.available ? "Available Now" : "Currently Unavailable"}
                    </span>
                  </div>
                </div>

                {donor.available && donor.phone && (
                  <a
                    href={"tel:" + donor.phone}
                    className="bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-all"
                  >
                    <Phone size={14} />
                    <span>Call</span>
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
