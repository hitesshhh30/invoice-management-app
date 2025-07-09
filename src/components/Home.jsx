import { useState } from "react"
import { Upload, Plus, DollarSign, Package, ImageIcon, Users } from "lucide-react"
import { nanoid } from "nanoid"

const Home = () => {
  const [formData, setFormData] = useState({
    designName: "",
    designCode: "",
    category: "",
    price: "",
    image: null,
  })
  const [previewImage, setPreviewImage] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const designData = {
      code: formData.designCode,
      name: formData.designName,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      imagePath: formData.image ? formData.image.name : null,
      uniqueCode: nanoid(8),
    }

    try {
      // Add design to database
      const result = await window.electronAPI.addDesign(designData)

      if (result.success) {
        // Reset form
        setFormData({
          designName: "",
          designCode: "",
          category: "",
          price: "",
          image: null,
        })
        setPreviewImage(null)

        alert("Design added successfully!")
      } else {
        throw new Error(result.error || "Failed to add design")
      }
    } catch (error) {
      console.error("Error adding design:", error)
      alert("Error adding design. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with breadcrumb */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <span className="hover:text-purple-600 cursor-pointer transition-colors">Dashboard</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mx-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-purple-600 font-medium">Add New Design</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Design</h1>
            <p className="text-gray-600">Create and manage your design catalog with ease</p>
          </div>

          <div className="mt-6 lg:mt-0 flex space-x-4">
            <button className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              Back
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              <Upload size={20} className="mr-2" />
              Import Designs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mr-4">
                <Package className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Designs</p>
                <div className="flex items-end">
                  <p className="text-3xl font-bold text-gray-900 leading-none">150</p>
                  <span className="text-sm text-green-600 font-semibold ml-3 mb-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    12%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">This Week</span>
                <span className="font-semibold text-gray-900">+8 designs</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mr-4">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">This Month Revenue</p>
                <div className="flex items-end">
                  <p className="text-3xl font-bold text-gray-900 leading-none">₹25,000</p>
                  <span className="text-sm text-green-600 font-semibold ml-3 mb-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    8.5%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Last Month</span>
                <span className="font-semibold text-gray-900">₹23,100</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Customers</p>
                <div className="flex items-end">
                  <p className="text-3xl font-bold text-gray-900 leading-none">45</p>
                  <span className="text-sm text-green-600 font-semibold ml-3 mb-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    4%
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">New This Week</span>
                <span className="font-semibold text-gray-900">+3 customers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Design Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="text-purple-600" size={24} />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Design Information</h2>
                  <p className="text-gray-600 mt-1">Enter the details of your new design</p>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>
                      Design Name <span className="text-red-500">*</span>
                    </span>
                    <span className="text-purple-600 text-xs font-medium cursor-pointer hover:text-purple-700">
                      Design name suggestions
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="designName"
                      value={formData.designName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm transition-all duration-200"
                      placeholder="Enter design name"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pl-1">Enter a descriptive name for your design</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Design Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="designCode"
                      value={formData.designCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm transition-all duration-200"
                      placeholder="Enter design code"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pl-1">A unique code to identify this design</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm appearance-none bg-white transition-all duration-200"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="ethnic">Ethnic Wear</option>
                      <option value="casual">Casual Wear</option>
                      <option value="formal">Formal Wear</option>
                      <option value="party">Party Wear</option>
                      <option value="wedding">Wedding Collection</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pl-1">Select the most appropriate category</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 shadow-sm transition-all duration-200"
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-500 font-semibold text-lg">₹</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 pl-1">Enter the retail price for this design</p>
                </div>

                <div className="pt-4 border-t border-gray-200 mt-8">
                  <div className="bg-purple-50 rounded-xl px-6 py-4 flex border border-purple-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-purple-800">Need help with design details?</p>
                      <p className="text-xs text-purple-700 mt-1">
                        Our team can help you optimize your design catalog for better sales. Contact support for
                        assistance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Design Image <span className="text-gray-500 text-xs font-normal">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-8 text-center h-[300px] flex flex-col items-center justify-center hover:bg-gray-100 hover:border-purple-300 transition-all duration-200">
                  {previewImage ? (
                    <div className="space-y-4 w-full">
                      <div className="relative w-full max-w-[220px] mx-auto">
                        <img
                          src={previewImage || "/placeholder.svg"}
                          alt="Design preview"
                          className="max-w-full h-40 object-contain mx-auto rounded-xl border-2 p-3 bg-white shadow-md"
                        />
                        <div className="absolute -top-2 -right-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null)
                              setFormData((prev) => ({ ...prev, image: null }))
                            }}
                            className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 p-2 rounded-full transition-colors shadow-md"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium">Image uploaded successfully</p>
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById("design-image-upload").click()
                        }}
                        className="text-purple-600 hover:text-purple-700 font-medium mx-auto bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                        <ImageIcon size={36} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold text-lg">Drag and drop image here</p>
                        <p className="text-gray-500 mt-1">- or -</p>
                        <label className="cursor-pointer inline-block mt-3 bg-white border-2 border-gray-300 rounded-xl px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 shadow-sm">
                          Browse Files
                          <input
                            id="design-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-gray-500 text-xs mt-3">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Image Guidelines:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Use high-resolution images (min 800×800 pixels)
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Clear background with proper lighting
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Show design from multiple angles if possible
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center p-8 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-600">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Fields marked with <span className="text-red-500 font-semibold">*</span> are required
                </span>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus size={18} className="mr-2" />
                  Add Design
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">© 2023 Vyapar App. All rights reserved.</div>
      </div>
    </div>
  )
}

export default Home