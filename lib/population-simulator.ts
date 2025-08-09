export interface SimulationParams {
  currentPopulation: number; // in millions
  birthRate: number; // births per woman
  lifeExpectancy: number; // years
  immigrationRate: number; // thousands per year
  startYear?: number;
  ageStructure?: {
    youth: number;    // % of 0-14 years
    working: number;  // % of 15-64 years
    elderly: number;  // % of 65+ years
  };
}

export interface PopulationData {
  year: number;
  totalPopulation: number;
  youth: number; // 0-14
  workingAge: number; // 15-64
  elderly: number; // 65+
  birthRate: number;
  deathRate: number;
  naturalGrowthRate: number;
  dependencyRatio: number;
  medianAge: number;
  populationPyramid: AgeGroup[];
}

export interface AgeGroup {
  age: string;
  male: number;
  female: number;
}

export interface ProjectionResult {
  data: PopulationData[];
  halfPoint: number | null;
  extinctionPoint: number | null;
  peakYear: number | null;
  peakPopulation: number | null;
}

export class PopulationSimulator {
  private readonly REPLACEMENT_RATE = 2.1;
  private readonly GENERATION_LENGTH = 30;
  
  simulate(params: SimulationParams, years: number = 100): ProjectionResult {
    const {
      currentPopulation,
      birthRate,
      lifeExpectancy,
      immigrationRate,
      startYear = 2025
    } = params;
    
    const data: PopulationData[] = [];
    const initialPop = currentPopulation * 1000000; // Convert to actual numbers
    
    // Initialize age structure - use UN data if available, otherwise estimate based on birth rate
    let youthRatio: number;
    let elderlyRatio: number;
    let workingRatio: number;
    
    if (params.ageStructure) {
      // Use actual UN data if provided
      youthRatio = params.ageStructure.youth / 100;
      workingRatio = params.ageStructure.working / 100;
      elderlyRatio = params.ageStructure.elderly / 100;
    } else {
      // Fallback to birth rate estimation
      if (birthRate < 1.0) {
        // Extreme crisis (like Korea, Taiwan)
        youthRatio = 0.11;  // 11% youth
        elderlyRatio = 0.18; // 18% elderly
      } else if (birthRate < 1.5) {
        // Severe crisis (like Japan, Italy)
        youthRatio = 0.13;  // 13% youth
        elderlyRatio = 0.20; // 20% elderly
      } else if (birthRate < 2.1) {
        // Below replacement
        youthRatio = 0.16;  // 16% youth
        elderlyRatio = 0.15; // 15% elderly
      } else if (birthRate < 3.0) {
        // Near or above replacement
        youthRatio = 0.20;  // 20% youth
        elderlyRatio = 0.12; // 12% elderly
      } else {
        // High birth rate (developing countries)
        youthRatio = 0.30;  // 30% youth
        elderlyRatio = 0.08; // 8% elderly
      }
      workingRatio = 1 - youthRatio - elderlyRatio;
    }
    
    let youth = initialPop * youthRatio;
    let workingAge = initialPop * workingRatio;
    let elderly = initialPop * elderlyRatio;
    
    let peakPopulation = currentPopulation;
    let peakYear = startYear;
    let halfPoint: number | null = null;
    let extinctionPoint: number | null = null;
    
    for (let yearOffset = 0; yearOffset <= years; yearOffset += 5) {
      const currentYear = startYear + yearOffset;
      let totalPop = youth + workingAge + elderly;
      
      if (yearOffset > 0) {
        // Calculate demographic changes
        const fertilityFactor = birthRate / this.REPLACEMENT_RATE;
        const generationsPassed = yearOffset / this.GENERATION_LENGTH;
        
        // Birth calculations
        const womenOfChildbearingAge = workingAge * 0.25; // Women aged 15-45 roughly
        const annualBirths = (womenOfChildbearingAge * birthRate / 30) * 5; // 5-year period
        
        // Death calculations based on age structure and life expectancy
        const youthMortality = youth * 0.001 * 5; // Very low youth mortality
        const workingMortality = workingAge * 0.003 * 5; // Low working age mortality
        // Elderly mortality based on life expectancy (higher but realistic)
        const elderlyMortality = elderly * (0.04 * 5); // ~4% per year for elderly
        const totalDeaths = youthMortality + workingMortality + elderlyMortality;
        
        // Immigration effect (5-year total)
        const immigrationEffect = immigrationRate * 1000 * 5;
        
        // Age transitions (5-year period)
        // Youth to working: 1/3 of youth transition over 15 years, so 1/3 * 5/15 = 1/9 per 5 years
        const youthToWorking = youth * (5.0 / 15.0); // 5 years out of 15 years of youth
        // Working to elderly: transition from 15-64 to 65+, so over 50 years
        const workingToElderly = workingAge * (5.0 / 50.0); // 5 years out of 50 years of working age
        
        // Update age groups
        youth = youth + annualBirths - youthMortality - youthToWorking;
        workingAge = workingAge + youthToWorking - workingMortality - workingToElderly + immigrationEffect * 0.7;
        elderly = elderly + workingToElderly - elderlyMortality + immigrationEffect * 0.3;
        
        // Additional aging effect for low birth rate societies
        if (birthRate < 1.5 && yearOffset > 20) {
          // Accelerate aging in severe crisis countries after 20 years
          const additionalAging = workingAge * 0.01 * Math.min((yearOffset - 20) / 50, 1);
          workingAge = Math.max(0, workingAge - additionalAging);
          elderly = elderly + additionalAging;
        }
        
        // Ensure non-negative populations
        youth = Math.max(0, youth);
        workingAge = Math.max(0, workingAge);
        elderly = Math.max(0, elderly);
        
        totalPop = youth + workingAge + elderly;
      }
      
      // Calculate statistics
      const totalPopInMillions = totalPop / 1000000;
      const birthRatePerThousand = (birthRate * 15); // Rough conversion
      const deathRate = elderly / totalPop * 30; // Simplified death rate
      const naturalGrowthRate = birthRatePerThousand - deathRate;
      const dependencyRatio = (youth + elderly) / Math.max(1, workingAge);
      const medianAge = 30 + (elderly / totalPop) * 40; // Simplified median age
      
      // Create population pyramid
      const populationPyramid = this.generatePyramid(youth, workingAge, elderly, totalPop);
      
      data.push({
        year: currentYear,
        totalPopulation: totalPopInMillions,
        youth: youth / 1000000,
        workingAge: workingAge / 1000000,
        elderly: elderly / 1000000,
        birthRate: birthRatePerThousand,
        deathRate,
        naturalGrowthRate,
        dependencyRatio,
        medianAge,
        populationPyramid
      });
      
      // Track peak population
      if (totalPopInMillions > peakPopulation) {
        peakPopulation = totalPopInMillions;
        peakYear = currentYear;
      }
      
      // Check for half point
      if (!halfPoint && totalPopInMillions <= currentPopulation / 2) {
        halfPoint = currentYear;
      }
      
      // Check for near-extinction (< 1 million)
      if (!extinctionPoint && totalPopInMillions < 1) {
        extinctionPoint = currentYear;
      }
    }
    
    return {
      data,
      halfPoint,
      extinctionPoint,
      peakYear: peakYear === startYear ? null : peakYear,
      peakPopulation: peakPopulation === currentPopulation ? null : peakPopulation
    };
  }
  
  private generatePyramid(youth: number, workingAge: number, elderly: number, total: number): AgeGroup[] {
    // Simplified population pyramid generation
    const pyramid: AgeGroup[] = [];
    const ageGroups = [
      { label: '0-4', proportion: 0.05, fromGroup: 'youth' },
      { label: '5-9', proportion: 0.05, fromGroup: 'youth' },
      { label: '10-14', proportion: 0.05, fromGroup: 'youth' },
      { label: '15-19', proportion: 0.067, fromGroup: 'working' },
      { label: '20-24', proportion: 0.067, fromGroup: 'working' },
      { label: '25-29', proportion: 0.067, fromGroup: 'working' },
      { label: '30-34', proportion: 0.067, fromGroup: 'working' },
      { label: '35-39', proportion: 0.067, fromGroup: 'working' },
      { label: '40-44', proportion: 0.067, fromGroup: 'working' },
      { label: '45-49', proportion: 0.067, fromGroup: 'working' },
      { label: '50-54', proportion: 0.067, fromGroup: 'working' },
      { label: '55-59', proportion: 0.067, fromGroup: 'working' },
      { label: '60-64', proportion: 0.067, fromGroup: 'working' },
      { label: '65-69', proportion: 0.06, fromGroup: 'elderly' },
      { label: '70-74', proportion: 0.05, fromGroup: 'elderly' },
      { label: '75-79', proportion: 0.04, fromGroup: 'elderly' },
      { label: '80+', proportion: 0.03, fromGroup: 'elderly' }
    ];
    
    for (const group of ageGroups) {
      let groupPop = 0;
      if (group.fromGroup === 'youth') {
        groupPop = youth * (group.proportion / 0.15);
      } else if (group.fromGroup === 'working') {
        groupPop = workingAge * (group.proportion / 0.67);
      } else {
        groupPop = elderly * (group.proportion / 0.18);
      }
      
      pyramid.push({
        age: group.label,
        male: (groupPop * 0.51) / 1000000, // Slightly more males at birth
        female: (groupPop * 0.49) / 1000000
      });
    }
    
    return pyramid;
  }
}