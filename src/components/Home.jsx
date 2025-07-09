import { useState } from "react"
import { Package, ImageIcon, Plus, X, CheckCircle } from "lucide-react"
import { nanoid } from "nanoid"
import DesignImage from './DesignImage'

const Home = () => {
  const [formData, setFormData] = useState({
    designName: "",
    designCode: "",
    category: "",
    price: "",
    image: null,
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

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

    // Check if image is provided (now required)
    if (!formData.image) {
      alert("Please upload a design image")
      return
    }

    try {
      // First save the image file
      const reader = new FileReader()
      const imageDataPromise = new Promise((resolve) => {
        reader.onload = (e) => {
          const arrayBuffer = e.target.result
          const uint8Array = new Uint8Array(arrayBuffer)
          resolve(uint8Array)
        }
        reader.readAsArrayBuffer(formData.image)
      })

      const imageData = await imageDataPromise
      const fileName = `${Date.now()}_${formData.image.name}`
      
      // Save image to uploads folder
      const imageResult = await window.electronAPI.saveImage(imageData, fileName)
      
      if (!imageResult.success) {
        alert("Failed to save image")
        return
      }

      const designData = {
        code: formData.designCode,
        name: formData.designName,
        category: formData.category,
        price: Number.parseFloat(formData.price),
        imagePath: imageResult.filePath,
        uniqueCode: nanoid(8),
      }

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
        
        // Show success popup
        setShowSuccessPopup(true)
        
        // Auto-hide popup after 3 seconds
        setTimeout(() => {
          setShowSuccessPopup(false)
        }, 3000)
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
        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed top-6 right-6 z-50 bg-white rounded-xl shadow-xl border border-green-100 p-4 w-80 animate-fade-in">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-gray-800 font-semibold mb-1">Design Added Successfully</h4>
                <p className="text-gray-600 text-sm">Your new design has been added to the catalog.</p>
              </div>
              <button 
                onClick={() => setShowSuccessPopup(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

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

          <div className="mt-6 lg:mt-0">
            {/* Back button removed */}
          </div>
        </div>

        {/* Design Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white rounded-t-2xl">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="text-purple-600" size={20} />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-bold text-gray-900">Design Information</h2>
                  <p className="text-sm text-gray-600">Enter the details of your new design</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              </div>

              {/* Right Column */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Design Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-6 text-center h-[250px] flex flex-col items-center justify-center hover:bg-gray-100 hover:border-purple-300 transition-all duration-200">
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

                {/* Image Guidelines section removed */}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center p-6 bg-gray-50 rounded-b-2xl">
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
                  onClick={() => {
                    setFormData({
                      designName: "",
                      designCode: "",
                      category: "",
                      price: "",
                      image: null,
                    });
                    setPreviewImage(null);
                  }}
                  className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                >
                  Reset
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

        <div className="mt-8 text-center text-sm text-gray-500">© 2025 Invoice Management App. All rights reserved.</div>
      </div>
    </div>
  )
}

export default Home