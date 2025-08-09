export interface SimulationParams {
  currentPopulation: number; // in millions
  birthRate: number; // births per woman
  lifeExpectancy: number; // years
  immigrationRate: number; // thousands per year
  startYear?: number;
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
    
    // Initialize age structure based on birth rate (more realistic)
    // Countries with lower birth rates tend to have fewer youth and more elderly
    let youthRatio: number;
    let elderlyRatio: number;
    
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
    
    let youth = initialPop * youthRatio;
    let workingAge = initialPop * (1 - youthRatio - elderlyRatio);
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
        const womenOfChildbearingAge = workingAge * 0.25; // Rough estimate
        const annualBirths = (womenOfChildbearingAge * birthRate / 30) * 5; // 5-year period
        
        // Death calculations based on age structure
        const youthMortality = youth * 0.001 * 5;
        const workingMortality = workingAge * 0.005 * 5;
        const elderlyMortality = elderly * ((100 - lifeExpectancy) / 100) * 5;
        const totalDeaths = youthMortality + workingMortality + elderlyMortality;
        
        // Immigration effect (5-year total)
        const immigrationEffect = immigrationRate * 1000 * 5;
        
        // Age transitions
        const youthToWorking = youth * 0.067 * 5; // ~1/15 of youth age up every 5 years
        const workingToElderly = workingAge * 0.015 * 5;
        
        // Update age groups
        youth = youth + annualBirths - youthMortality - youthToWorking;
        workingAge = workingAge + youthToWorking - workingMortality - workingToElderly + immigrationEffect * 0.7;
        elderly = elderly + workingToElderly - elderlyMortality + immigrationEffect * 0.3;
        
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
  
  // Generate scenarios
  static getScenarios() {
    return {
      current_korea: {
        name: '현재 한국',
        params: {
          currentPopulation: 51.8,
          birthRate: 0.72,
          lifeExpectancy: 83,
          immigrationRate: 0
        }
      },
      optimistic: {
        name: '낙관적 시나리오',
        params: {
          currentPopulation: 51.8,
          birthRate: 1.5,
          lifeExpectancy: 85,
          immigrationRate: 100
        }
      },
      pessimistic: {
        name: '비관적 시나리오',
        params: {
          currentPopulation: 51.8,
          birthRate: 0.5,
          lifeExpectancy: 82,
          immigrationRate: -20
        }
      },
      france_level: {
        name: '프랑스 수준',
        params: {
          currentPopulation: 51.8,
          birthRate: 1.8,
          lifeExpectancy: 83,
          immigrationRate: 50
        }
      },
      replacement: {
        name: '인구 유지 수준',
        params: {
          currentPopulation: 51.8,
          birthRate: 2.1,
          lifeExpectancy: 85,
          immigrationRate: 30
        }
      }
    };
  }
}