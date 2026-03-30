import { SearchIcon } from 'lucide-react'
import React from 'react'

const SearchSection = () => {
  return (
    <div className="search_wrapper ">
      <div className="container position-relative">
        <h3 className="widget-title">
            <span>Search here!</span>
	    </h3>
        <div className="row align-items-stretch">

          {/* LEFT SIDE */}
          <div className="col-lg-10 bg-white p-0 d-flex">
            <div className="left_side w-100">
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="What are you looking for ?"
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your location"
                  />
                </div>

                <div className="col-md-4">
                  <select className="form-select">
                    <option>Select Category</option>
                    <option>Childcare Centre Manager</option>
                    <option>Childcare Assistant Centre Manager</option>
                    <option>Early Childhood Teacher</option>
                    <option>Childcare Lead Educator</option>
                    <option>Childcare Assistant Educator</option>
                    <option>Childcare Cook</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-lg-2 p-0 d-flex">
            <button className="right_side w-100 d-flex flex-column align-items-center justify-content-center">
                <img src="/images/search.png" alt="" />
                <h6 className='mt-4 text-white'>SEARCH</h6>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SearchSection