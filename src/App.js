import jsPDF from "jspdf";
import React, { useState } from 'react'

const BACKEND_URL = 'https://geotabs-backend.onrender.com'; // Replace with YOUR Render URL

export default function App(){
  const [projectName, setProjectName] = useState('New GeoTABS Project')
  const [inputs, setInputs] = useState({
    buildingArea_m2: 1000,
    buildingType: 'Office',
    buildingTier: 'Tier-2',
    state: 'National Average',
    climate: 'Composite',
    soilType: 'Alluvial Plains',
    peakCooling_kW: '',
    peakHeating_kW: '',
    gsHeatPumpCOP: 4.0,
    soilConductivity_WpmK: 2.2,
    method: 'standard'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const downloadPDF = () => {
    if (!result || !result.economics) return;

    const doc = new jsPDF();
    let y = 15;

    // Header
    doc.setFontSize(16);
    doc.text("GeoTABS Feasibility Report", 14, y);
    y += 8;
    
    doc.setFontSize(9);
    doc.text("Pan-India Geothermal TABS Assessment Tool", 14, y);
    y += 10;

    // Project Info
    doc.setFontSize(11);
    doc.text("Project Information", 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.text(`Project Name: ${projectName}`, 14, y); y += 5;
    doc.text(`Building Type: ${inputs.buildingType} (${inputs.buildingTier})`, 14, y); y += 5;
    doc.text(`Location: ${inputs.state}`, 14, y); y += 5;
    doc.text(`Climate Zone: ${inputs.climate}`, 14, y); y += 5;
    doc.text(`Soil Type: ${inputs.soilType}`, 14, y); y += 8;

    // Feasibility Banner
    doc.setFontSize(12);
    doc.setFillColor(result.feasibility_recommendation === "Highly Feasible" ? 209 : 
                     result.feasibility_recommendation === "Conditionally Feasible" ? 254 : 254, 
                     result.feasibility_recommendation === "Highly Feasible" ? 250 : 
                     result.feasibility_recommendation === "Conditionally Feasible" ? 243 : 226,
                     result.feasibility_recommendation === "Highly Feasible" ? 229 : 
                     result.feasibility_recommendation === "Conditionally Feasible" ? 199 : 226);
    doc.rect(14, y, 182, 12, 'F');
    doc.text(`Recommendation: ${result.feasibility_recommendation}`, 18, y + 8);
    y += 15;
    
    doc.setFontSize(9);
    doc.text(`Total Score: ${result.total_score} / 15`, 14, y); y += 8;

    // Performance Summary
    doc.setFontSize(11);
    doc.text("Performance Summary", 14, y); y += 6;
    doc.setFontSize(9);
    doc.text(`Peak Cooling Load: ${result.inputs.peakCooling_kW} kW (${result.inputs.peakCooling_source})`, 14, y); y += 5;
    doc.text(`Annual Energy Use: ${result.energy.annual_kWh.toLocaleString()} kWh`, 14, y); y += 5;
    doc.text(`Energy Savings: ${result.energy.savings_kWh.toLocaleString()} kWh/year`, 14, y); y += 5;
    doc.text(`CO2 Reduction: ${result.co2_savings_tonnes} tonnes/year`, 14, y); y += 8;

    // Economic Analysis
    doc.setFontSize(11);
    doc.text("Economic Feasibility", 14, y); y += 6;
    doc.setFontSize(9);
    doc.text(`Electricity Rate: Rs ${result.economics.electricity_rate}/kWh (${inputs.state})`, 14, y); y += 5;
    doc.text(`Annual Cost Savings: Rs ${result.economics.annual_savings_INR.toLocaleString('en-IN')}`, 14, y); y += 5;
    doc.text(`Estimated Capital Cost: Rs ${(result.economics.capital_cost_INR/100000).toFixed(1)} Lakhs`, 14, y); y += 5;
    doc.text(`Simple Payback Period: ${result.economics.payback_years} years`, 14, y); y += 8;

    // Ground Loop Design
    doc.setFontSize(11);
    doc.text("Ground Loop Specifications", 14, y); y += 6;
    doc.setFontSize(9);
    doc.text(`Required Loop Length: ${result.ground_loop.loop_length_m} m`, 14, y); y += 5;
    doc.text(`Number of Boreholes: ${result.ground_loop.borehole_count} (100m deep each)`, 14, y); y += 5;
    doc.text(`Land Area Required: ${result.ground_loop.land_area_m2} sq.m (approx)`, 14, y); y += 5;
    doc.text(`Soil Conductivity: ${inputs.soilConductivity_WpmK} W/m.K`, 14, y); y += 8;

    // Feasibility Score Breakdown
    doc.setFontSize(11);
    doc.text("Feasibility Score Breakdown", 14, y); y += 6;
    doc.setFontSize(9);
    doc.text(`Load Suitability: ${result.scores.load}/3 - Building thermal characteristics`, 14, y); y += 5;
    doc.text(`Capacity Adequacy: ${result.scores.capacity}/3 - System sizing margin`, 14, y); y += 5;
    doc.text(`Energy Benefit: ${result.scores.energy}/3 - Annual energy savings potential`, 14, y); y += 5;
    doc.text(`Climate Suitability: ${result.scores.climate}/3 - Regional climate match`, 14, y); y += 5;
    doc.text(`Economic Viability: ${result.scores.economic}/3 - Payback period assessment`, 14, y); y += 8;

    // Regional Context
    doc.setFontSize(11);
    doc.text("Regional Context", 14, y); y += 6;
    doc.setFontSize(9);
    doc.text(`Climate Zone: ${inputs.climate} (${result.climate_data.examples})`, 14, y); y += 5;
    doc.text(`Cooling months: ${result.climate_data.cooling_months}, Heating months: ${result.climate_data.heating_months}`, 14, y); y += 5;
    doc.text(`Ground temperature: ~${result.climate_data.ground_temp_C} deg C year-round`, 14, y); y += 5;
    doc.text(`Annual operating hours: ${result.energy.operating_hours} hrs`, 14, y); y += 10;

    // Footer
    doc.setFontSize(7);
    doc.text("Developed under Core Research Grant: 'Shallow Geothermal integrated thermally activated building cooling system design – Pathway to nature based free cooling (GeoTABS)'", 14, 280);
    doc.text("Tool enables rapid feasibility assessment across India's diverse climate and economic conditions", 14, 285);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | Tool Version: 2.0`, 14, 290);

    doc.save(`${projectName || "GeoTABS"}_Feasibility_Report.pdf`);
  };

  function handleChange(e){
    const { name, value } = e.target
    
    // Update soil conductivity when soil type changes
    if(name === 'soilType'){
      const soilK = {
        'Alluvial Plains': 2.2,
        'Black Soil': 1.8,
        'Red Soil': 1.6,
        'Laterite': 1.4,
        'Sandy': 2.5,
        'Rocky/Hard': 3.0
      }
      setInputs(prev => ({ 
        ...prev, 
        soilType: value, 
        soilConductivity_WpmK: soilK[value] || 2.0 
      }))
    } else {
      setInputs(prev => ({ ...prev, [name]: isNaN(value) ? value : (value === '' ? '' : Number(value)) }))
    }
  }

  async function handleRun(){
    setLoading(true)
    setResult(null)
    try{
      const resp = await fetch(`${BACKEND_URL}/api/calculate`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({projectName, inputs})
      })
      const data = await resp.json()
      setResult(data)
    }catch(err){
      setResult({error: err.message})
    }finally{
      setLoading(false)
    }
  }

  async function downloadReport(){
    const resp = await fetch(`${BACKEND_URL}/api/report`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({projectName, inputs})
    })
    if(!resp.ok){ alert('Failed to generate report'); return }
    const blob = await resp.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = projectName.replace(/\s+/g,'_') + '_report.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (<div style={{fontFamily:'Arial,Helvetica,sans-serif',padding:20,maxWidth:1200,margin:'0 auto'}}>
    <h1 style={{color:'#1e40af'}}>GeoTABS Design Tool - India Edition</h1>
    <p style={{color:'#64748b',marginTop:-10}}>Pan-India Geothermal TABS Feasibility Assessment</p>
    
    <div style={{background:'#f8fafc',padding:20,borderRadius:8,marginBottom:20}}>
      <h2 style={{marginTop:0,fontSize:18}}>Project Details</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:15}}>
        
        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Project Name</label>
          <input value={projectName} onChange={e=>setProjectName(e.target.value)} 
                 style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}/>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Building Type</label>
          <select name="buildingType" value={inputs.buildingType} onChange={handleChange}
                  style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}>
            <option value="Office">Office</option>
            <option value="Educational">Educational</option>
            <option value="Residential">Residential</option>
            <option value="Hospital">Hospital</option>
            <option value="Hotel">Hotel</option>
            <option value="IT/Tech Park">IT/Tech Park</option>
          </select>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Building Tier</label>
          <select name="buildingTier" value={inputs.buildingTier} onChange={handleChange}
                  style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}>
            <option value="Tier-1">Tier-1 (Metro cities)</option>
            <option value="Tier-2">Tier-2 (Major cities)</option>
            <option value="Tier-3">Tier-3 (Smaller towns)</option>
          </select>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>State/Region</label>
          <select name='state' value={inputs.state} onChange={handleChange}
                  style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Delhi">Delhi</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Telangana">Telangana</option>
            <option value="Kerala">Kerala</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="National Average">National Average</option>
          </select>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Climate Zone</label>
          <select name='climate' value={inputs.climate} onChange={handleChange}
                  style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}>
            <option value="Hot-Dry">Hot-Dry </option>
            <option value="Warm-Humid">Warm-Humid </option>
            <option value="Composite">Composite </option>
            <option value="Temperate">Temperate </option>
            <option value="Cold">Cold </option>
          </select>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Soil Type</label>
          <select name='soilType' value={inputs.soilType} onChange={handleChange}
                  style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}>
            <option value="Alluvial Plains">Alluvial Plains (2.2 W/m·K)</option>
            <option value="Black Soil">Black Soil (1.8 W/m·K)</option>
            <option value="Red Soil">Red Soil (1.6 W/m·K)</option>
            <option value="Laterite">Laterite (1.4 W/m·K)</option>
            <option value="Sandy">Sandy (2.5 W/m·K)</option>
            <option value="Rocky/Hard">Rocky/Hard (3.0 W/m·K)</option>
          </select>
        </div>

      </div>
    </div>

    <div style={{background:'#f8fafc',padding:20,borderRadius:8,marginBottom:20}}>
      <h2 style={{marginTop:0,fontSize:18}}>Technical Parameters</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:15}}>
        
        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Building Area (m²)</label>
          <input name='buildingArea_m2' type="number" value={inputs.buildingArea_m2} onChange={handleChange}
                 style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}/>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Peak Cooling (kW) 
            <span style={{color:'#64748b',fontWeight:'normal'}}> - optional</span>
          </label>
          <input name='peakCooling_kW' type="number" value={inputs.peakCooling_kW} onChange={handleChange}
                 placeholder='Auto-estimated if blank'
                 style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}/>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Peak Heating (kW)
            <span style={{color:'#64748b',fontWeight:'normal'}}> - optional</span>
          </label>
          <input name='peakHeating_kW' type="number" value={inputs.peakHeating_kW} onChange={handleChange}
                 placeholder='Auto-estimated if blank'
                 style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}/>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>GeoTABS COP</label>
          <input name='gsHeatPumpCOP' type="number" step="0.1" value={inputs.gsHeatPumpCOP} onChange={handleChange}
                 style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}/>
        </div>

        <div>
          <label style={{fontWeight:'bold',display:'block',marginBottom:5}}>Soil Conductivity (W/m·K)</label>
          <input name='soilConductivity_WpmK' type="number" step="0.1" value={inputs.soilConductivity_WpmK} 
                 onChange={handleChange}
                 style={{width:'100%',padding:8,border:'1px solid #cbd5e1',borderRadius:4}}/>
        </div>

      </div>
    </div>

    <div style={{marginBottom:20}}>
      <button onClick={handleRun} disabled={loading}
              style={{padding:'10px 20px',background:'#2563eb',color:'white',border:'none',
                      borderRadius:6,cursor:'pointer',fontSize:16,fontWeight:'bold',marginRight:10}}>
        {loading? 'Running Analysis...':'Run Feasibility Analysis'}
      </button>
      <button onClick={downloadReport}
              style={{padding:'10px 20px',background:'#64748b',color:'white',border:'none',
                      borderRadius:6,cursor:'pointer',fontSize:16,marginRight:10}}>
        Download JSON
      </button>
      <button onClick={downloadPDF} disabled={!result || !result.economics}
              style={{padding:'10px 20px',background:'#dc2626',color:'white',border:'none',
                      borderRadius:6,cursor:(result && result.economics)?'pointer':'not-allowed',fontSize:16,
                      opacity:(result && result.economics)?1:0.5}}>
        Download PDF Report
      </button>
    </div>

    {result && result.error && (
      <div style={{background:'#fee2e2',padding:15,borderRadius:6,color:'#991b1b'}}>
        <strong>Error:</strong> {result.error}
      </div>
    )}

    {result && !result.error && result.economics && (
      <div>
        
        {/* Feasibility Banner */}
        <div style={{
          padding:20, borderRadius:8, marginBottom:20,
          backgroundColor: result.feasibility_recommendation === "Highly Feasible" ? "#d1fae5" :
                          result.feasibility_recommendation === "Conditionally Feasible" ? "#fef3c7" : "#fee2e2"
        }}>
          <h2 style={{margin:0,fontSize:24}}>{result.feasibility_recommendation}</h2>
          <p style={{margin:'10px 0 0 0',fontSize:16}}>
            <strong>Total Score:</strong> {result.total_score} / 15
          </p>
        </div>

        {/* Main Results Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:20,marginBottom:20}}>
          
          {/* Performance Summary */}
          <div style={{background:'#f8fafc',padding:20,borderRadius:8}}>
            <h3 style={{marginTop:0,color:'#1e40af'}}>Performance Summary</h3>
            <div style={{fontSize:14}}>
              <p><strong>Peak Cooling Load:</strong> {result.inputs.peakCooling_kW} kW</p>
              <p style={{fontSize:12,color:'#64748b',marginTop:-10}}>
                ({result.inputs.peakCooling_source})
              </p>
              <p><strong>Annual Energy Use:</strong> {result.energy.annual_kWh.toLocaleString()} kWh</p>
              <p><strong>Energy Savings:</strong> {result.energy.savings_kWh.toLocaleString()} kWh/year</p>
              <p><strong>CO₂ Reduction:</strong> {result.co2_savings_tonnes} tonnes/year</p>
              <p><strong>Operating Hours:</strong> {result.energy.operating_hours} hrs/year</p>
            </div>
          </div>

          {/* Economic Analysis */}
          <div style={{background:'#f8fafc',padding:20,borderRadius:8}}>
            <h3 style={{marginTop:0,color:'#1e40af'}}>Economic Analysis</h3>
            <div style={{fontSize:14}}>
              <p><strong>Electricity Rate:</strong> ₹{result.economics.electricity_rate}/kWh</p>
              <p><strong>Annual Savings:</strong> ₹{result.economics.annual_savings_INR.toLocaleString('en-IN')}</p>
              <p><strong>Capital Cost:</strong> ₹{(result.economics.capital_cost_INR/100000).toFixed(2)} Lakhs</p>
              <p><strong>Payback Period:</strong> {result.economics.payback_years} years</p>
              <p style={{fontSize:12,color:'#64748b',marginTop:10}}>
                Based on {inputs.state} electricity rates
              </p>
            </div>
          </div>

          {/* Ground Loop Design */}
          <div style={{background:'#f8fafc',padding:20,borderRadius:8}}>
            <h3 style={{marginTop:0,color:'#1e40af'}}>Ground Loop Design</h3>
            <div style={{fontSize:14}}>
              <p><strong>Loop Length:</strong> {result.ground_loop.loop_length_m} m</p>
              <p><strong>Boreholes:</strong> {result.ground_loop.borehole_count} × 100m deep</p>
              <p><strong>Land Area:</strong> {result.ground_loop.land_area_m2} m²</p>
              <p><strong>Soil Type:</strong> {inputs.soilType}</p>
              <p><strong>Thermal Output:</strong> {result.ground_loop.watts_per_meter} W/m</p>
            </div>
          </div>

        </div>

        {/* Score Breakdown */}
        <div style={{background:'#f8fafc',padding:20,borderRadius:8,marginBottom:20}}>
          <h3 style={{marginTop:0,color:'#1e40af'}}>Feasibility Score Breakdown</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:15}}>
            <div>
              <div style={{fontSize:12,color:'#64748b'}}>Load Suitability</div>
              <div style={{fontSize:24,fontWeight:'bold'}}>{result.scores.load}/3</div>
            </div>
            <div>
              <div style={{fontSize:12,color:'#64748b'}}>Capacity Adequacy</div>
              <div style={{fontSize:24,fontWeight:'bold'}}>{result.scores.capacity}/3</div>
            </div>
            <div>
              <div style={{fontSize:12,color:'#64748b'}}>Energy Benefit</div>
              <div style={{fontSize:24,fontWeight:'bold'}}>{result.scores.energy}/3</div>
            </div>
            <div>
              <div style={{fontSize:12,color:'#64748b'}}>Climate Suitability</div>
              <div style={{fontSize:24,fontWeight:'bold'}}>{result.scores.climate}/3</div>
            </div>
            <div>
              <div style={{fontSize:12,color:'#64748b'}}>Economic Viability</div>
              <div style={{fontSize:24,fontWeight:'bold'}}>{result.scores.economic}/3</div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{background:'#f8fafc',padding:20,borderRadius:8}}>
          <h3 style={{marginTop:0,color:'#1e40af'}}>Comparison with Conventional HVAC</h3>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead>
              <tr style={{background:'#e2e8f0'}}>
                <th style={{padding:10,textAlign:'left',border:'1px solid #cbd5e1'}}>Parameter</th>
                <th style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>GeoTABS</th>
                <th style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>Conventional</th>
                <th style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>Savings</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{padding:10,border:'1px solid #cbd5e1'}}>Annual Energy (kWh)</td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>
                  {result.energy.annual_kWh.toLocaleString()}
                </td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>
                  {result.energy.baseline_kWh.toLocaleString()}
                </td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1',color:'#16a34a',fontWeight:'bold'}}>
                  {result.energy.savings_kWh.toLocaleString()}
                </td>
              </tr>
              <tr style={{background:'#f8fafc'}}>
                <td style={{padding:10,border:'1px solid #cbd5e1'}}>Annual Cost (₹)</td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>
                  ₹{result.economics.geotabs_cost_INR.toLocaleString('en-IN')}
                </td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>
                  ₹{result.economics.baseline_cost_INR.toLocaleString('en-IN')}
                </td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1',color:'#16a34a',fontWeight:'bold'}}>
                  ₹{result.economics.annual_savings_INR.toLocaleString('en-IN')}
                </td>
              </tr>
              <tr>
                <td style={{padding:10,border:'1px solid #cbd5e1'}}>CO₂ Emissions (tonnes/yr)</td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>
                  {result.co2.geotabs_tonnes}
                </td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1'}}>
                  {result.co2.baseline_tonnes}
                </td>
                <td style={{padding:10,textAlign:'center',border:'1px solid #cbd5e1',color:'#16a34a',fontWeight:'bold'}}>
                  {result.co2.savings_tonnes}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Regional Context */}
        <div style={{background:'#eff6ff',padding:15,borderRadius:8,marginTop:20,fontSize:14}}>
          <h4 style={{margin:'0 0 10px 0',color:'#1e40af'}}>Regional Context: {inputs.climate} Zone</h4>
          <p style={{margin:'5px 0'}}><strong>Typical States:</strong> {result.climate_data.examples}</p>
          <p style={{margin:'5px 0'}}><strong>Operating Pattern:</strong> {result.climate_data.cooling_months} months cooling, {result.climate_data.heating_months} months heating</p>
          <p style={{margin:'5px 0'}}><strong>Ground Temperature:</strong> ~{result.climate_data.ground_temp_C}°C year-round</p>
        </div>

      </div>
    )}

    {!result && (
      <div style={{textAlign:'center',padding:40,color:'#64748b'}}>
        <p>Configure parameters above and click "Run Feasibility Analysis" to see results</p>
      </div>
    )}

  </div>)
}