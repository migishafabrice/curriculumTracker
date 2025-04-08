import React, { useCallback, useMemo } from 'react';
import { Provinces, Districts, Sectors, Cells, Villages } from 'rwanda';
import Select from 'react-select';

const Address = ({ address, onChange }) => {
  // Format options for react-select
  const formatOptions = (items) => 
    items.map(item => ({ value: item, label: item }));

  // Get address data
  const provinces = useMemo(() => formatOptions(Provinces()), []);

  const districts = useMemo(() => {
    if (!address.province) return [];
    return formatOptions(Districts(address.province));
  }, [address.province]);

  const sectors = useMemo(() => {
    if (!address.province || !address.district) return [];
    return formatOptions(Sectors(address.province, address.district));
  }, [address.province, address.district]);

  const cells = useMemo(() => {
    if (!address.province || !address.district || !address.sector) return [];
    return formatOptions(Cells(address.province, address.district, address.sector));
  }, [address.province, address.district, address.sector]);

  const villages = useMemo(() => {
    if (!address.province || !address.district || !address.sector || !address.cell) return [];
    return formatOptions(Villages(address.province, address.district, address.sector, address.cell));
  }, [address.province, address.district, address.sector, address.cell]);
  // Reset address hierarchy when a parent field changes
   // Find current selected values
  const selectedProvince = provinces.find(p => p.value === address.province);
  const selectedDistrict = districts.find(d => d.value === address.district);
  const selectedSector = sectors.find(s => s.value === address.sector);
  const selectedCell = cells.find(c => c.value === address.cell);
  const selectedVillage = villages.find(v => v.value === address.village);

  const handleChange = useCallback((field) => (selectedOption) => {
    
    onChange(field, selectedOption ? selectedOption.value : '');
  }, [onChange]);

  // Custom styles for react-select to match your form-floating look
  

  return (
    <>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="schoolProvince" className="form-label">
              <i className="fas fa-globe-africa me-2"></i>Province
            </label>
            <Select
              id="schoolProvince"
              name="province"
              value={selectedProvince}
              onChange={handleChange('province')}
              options={provinces}
              placeholder="Select Province"
              
              isClearable
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="schoolDistrict" className="form-label">
              <i className="fas fa-city me-2"></i>District
            </label>
            <Select
              id="schoolDistrict"
              name="district"
              value={selectedDistrict}
              onChange={handleChange('district')}
              options={districts}
              placeholder="Select District"
              
              isClearable
              isDisabled={!address.province}
              required
            />
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="schoolSector" className="form-label">
              <i className="fas fa-globe-africa me-2"></i>Sector
            </label>
            <Select
              id="schoolSector"
              name="sector"
              value={selectedSector}
              onChange={handleChange('sector')}
              options={sectors}
              placeholder="Select Sector"
              
              isClearable
              isDisabled={!address.district}
              required
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="schoolCell" className="form-label">
              <i className="fas fa-city me-2"></i>Cell
            </label>
            <Select
              id="schoolCell"
              name="cell"
              value={selectedCell}
              onChange={handleChange('cell')}
              options={cells}
              placeholder="Select Cell"
              
              isClearable
              isDisabled={!address.sector}
              required
            />
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-12">
          <div className="mb-3">
            <label htmlFor="schoolVillage" className="form-label">
              <i className="fas fa-globe-africa me-2"></i>Village
            </label>
            <Select
              id="schoolVillage"
              name="village"
              value={selectedVillage}
              onChange={handleChange('village')}
              options={villages}
              placeholder="Select Village"
              
              isClearable
              isDisabled={!address.cell}
              required
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Address);