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

// Constants for demographic calculations
const DEMOGRAPHIC_CONSTANTS = {
  REPLACEMENT_RATE: 2.1,
  GENERATION_LENGTH: 30,
  WOMEN_CHILDBEARING_RATIO: 0.25, // Women aged 15-45
  YOUTH_MORTALITY_RATE: 0.001,
  WORKING_MORTALITY_RATE: 0.003,
  ELDERLY_MORTALITY_RATE: 0.04,
  YOUTH_TRANSITION_YEARS: 15,
  WORKING_TRANSITION_YEARS: 50,
  CRITICAL_BIRTHRATE_THRESHOLD: 1.5,
  AGING_ACCELERATION_YEARS: 20,
  MILLION: 1000000,
  THOUSAND: 1000,
} as const;

// Custom error class for simulation errors
export class SimulationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'SimulationError';
  }
}

export class PopulationSimulator {
  private readonly constants = DEMOGRAPHIC_CONSTANTS;
  
  private validateParams(params: SimulationParams): void {
    if (params.currentPopulation <= 0) {
      throw new SimulationError('Current population must be positive', 'INVALID_POPULATION');
    }
    
    if (params.birthRate < 0 || params.birthRate > 10) {
      throw new SimulationError('Birth rate must be between 0 and 10', 'INVALID_BIRTH_RATE');
    }
    
    if (params.lifeExpectancy < 20 || params.lifeExpectancy > 120) {
      throw new SimulationError('Life expectancy must be between 20 and 120', 'INVALID_LIFE_EXPECTANCY');
    }
    
    if (params.immigrationRate < -1000 || params.immigrationRate > 10000) {
      throw new SimulationError('Immigration rate must be reasonable', 'INVALID_IMMIGRATION');
    }
    
    if (params.ageStructure) {
      const total = params.ageStructure.youth + params.ageStructure.working + params.ageStructure.elderly;
      if (Math.abs(total - 100) > 0.1) {
        throw new SimulationError('Age structure percentages must sum to 100', 'INVALID_AGE_STRUCTURE');
      }
    }
  }
  
  simulate(params: SimulationParams, years: number = 100): ProjectionResult {
    // Validate input parameters
    this.validateParams(params);
    
    if (years < 0 || years > 500) {
      throw new SimulationError('Simulation years must be between 0 and 500', 'INVALID_YEARS');
    }
    const {
      currentPopulation,
      birthRate,
      immigrationRate,
      startYear = 2025,
      ageStructure
    } = params;
    
    const data: PopulationData[] = [];
    const initialPop = currentPopulation * this.constants.MILLION;
    
    // Initialize age structure
    const { youthRatio, workingRatio, elderlyRatio } = this.getAgeStructureRatios(birthRate, ageStructure);
    
    let youth = initialPop * youthRatio;
    let workingAge = initialPop * workingRatio;
    let elderly = initialPop * elderlyRatio;
    
    let peakPopulation = currentPopulation;
    let peakYear = startYear;
    let halfPoint: number | null = null;
    let extinctionPoint: number | null = null;
    
    // Pre-calculate constants to avoid repeated calculations
    const stepSize = 5;
    const maxIterations = Math.floor(years / stepSize) + 1;
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const yearOffset = iteration * stepSize;
      const currentYear = startYear + yearOffset;
      let totalPop = youth + workingAge + elderly;
      
      if (yearOffset > 0) {
        // Calculate demographic changes for 5-year period
        const demographics = this.calculateDemographicChanges(
          { youth, workingAge, elderly },
          birthRate,
          immigrationRate,
          yearOffset
        );
        
        youth = demographics.youth;
        workingAge = demographics.workingAge;
        elderly = demographics.elderly;
        
        totalPop = youth + workingAge + elderly;
      }
      
      // Calculate statistics
      const stats = this.calculatePopulationStatistics(
        { youth, workingAge, elderly, totalPop },
        birthRate
      );
      
      // Create population pyramid - skip for performance on intermediate years
      // Only generate pyramid for every 10th year to save computation
      const populationPyramid = (yearOffset % 10 === 0) 
        ? this.generatePyramid(youth, workingAge, elderly)
        : [];
      
      data.push({
        year: currentYear,
        totalPopulation: stats.totalPopInMillions,
        youth: youth / this.constants.MILLION,
        workingAge: workingAge / this.constants.MILLION,
        elderly: elderly / this.constants.MILLION,
        birthRate: stats.birthRatePerThousand,
        deathRate: stats.deathRate,
        naturalGrowthRate: stats.naturalGrowthRate,
        dependencyRatio: stats.dependencyRatio,
        medianAge: stats.medianAge,
        populationPyramid
      });
      
      // Track milestones
      const milestones = this.trackPopulationMilestones(
        stats.totalPopInMillions,
        currentPopulation,
        currentYear,
        { peakPopulation, peakYear, halfPoint, extinctionPoint }
      );
      
      peakPopulation = milestones.peakPopulation;
      peakYear = milestones.peakYear;
      halfPoint = milestones.halfPoint;
      extinctionPoint = milestones.extinctionPoint;
    }
    
    return {
      data,
      halfPoint,
      extinctionPoint,
      peakYear: peakYear === startYear ? null : peakYear,
      peakPopulation: peakPopulation === currentPopulation ? null : peakPopulation
    };
  }
  
  private getAgeStructureRatios(birthRate: number, ageStructure?: SimulationParams['ageStructure']) {
    if (ageStructure) {
      return {
        youthRatio: ageStructure.youth / 100,
        workingRatio: ageStructure.working / 100,
        elderlyRatio: ageStructure.elderly / 100
      };
    }
    
    // Estimate based on birth rate
    let youthRatio: number;
    let elderlyRatio: number;
    
    if (birthRate < 1.0) {
      youthRatio = 0.11;
      elderlyRatio = 0.18;
    } else if (birthRate < 1.5) {
      youthRatio = 0.13;
      elderlyRatio = 0.20;
    } else if (birthRate < 2.1) {
      youthRatio = 0.16;
      elderlyRatio = 0.15;
    } else if (birthRate < 3.0) {
      youthRatio = 0.20;
      elderlyRatio = 0.12;
    } else {
      youthRatio = 0.30;
      elderlyRatio = 0.08;
    }
    
    return {
      youthRatio,
      workingRatio: 1 - youthRatio - elderlyRatio,
      elderlyRatio
    };
  }
  
  private calculateDemographicChanges(
    population: { youth: number; workingAge: number; elderly: number },
    birthRate: number,
    immigrationRate: number,
    yearOffset: number
  ) {
    const { youth, workingAge, elderly } = population;
    const PERIOD_YEARS = 5;
    
    // Optimize calculations by pre-computing multipliers
    const periodMultiplier = PERIOD_YEARS;
    
    // Birth calculations
    const womenOfChildbearingAge = workingAge * this.constants.WOMEN_CHILDBEARING_RATIO;
    const annualBirths = (womenOfChildbearingAge * birthRate / this.constants.GENERATION_LENGTH) * periodMultiplier;
    
    // Mortality calculations - use pre-computed multipliers
    const youthMortality = youth * (this.constants.YOUTH_MORTALITY_RATE * periodMultiplier);
    const workingMortality = workingAge * (this.constants.WORKING_MORTALITY_RATE * periodMultiplier);
    const elderlyMortality = elderly * (this.constants.ELDERLY_MORTALITY_RATE * periodMultiplier);
    
    // Immigration
    const immigrationEffect = immigrationRate * this.constants.THOUSAND * PERIOD_YEARS;
    
    // Age transitions
    const youthToWorking = youth * (PERIOD_YEARS / this.constants.YOUTH_TRANSITION_YEARS);
    const workingToElderly = workingAge * (PERIOD_YEARS / this.constants.WORKING_TRANSITION_YEARS);
    
    // Update populations
    const newYouth = youth + annualBirths - youthMortality - youthToWorking;
    let newWorkingAge = workingAge + youthToWorking - workingMortality - workingToElderly + immigrationEffect * 0.7;
    let newElderly = elderly + workingToElderly - elderlyMortality + immigrationEffect * 0.3;
    
    // Additional aging effect for low birth rate societies
    if (birthRate < this.constants.CRITICAL_BIRTHRATE_THRESHOLD && yearOffset > this.constants.AGING_ACCELERATION_YEARS) {
      const agingFactor = Math.min((yearOffset - this.constants.AGING_ACCELERATION_YEARS) / 50, 1);
      const additionalAging = newWorkingAge * 0.01 * agingFactor;
      newWorkingAge -= additionalAging;
      newElderly += additionalAging;
    }
    
    return {
      youth: Math.max(0, newYouth),
      workingAge: Math.max(0, newWorkingAge),
      elderly: Math.max(0, newElderly)
    };
  }
  
  private calculatePopulationStatistics(
    population: { youth: number; workingAge: number; elderly: number; totalPop: number },
    birthRate: number
  ) {
    const { youth, workingAge, elderly, totalPop } = population;
    
    return {
      totalPopInMillions: totalPop / this.constants.MILLION,
      birthRatePerThousand: birthRate * 15,
      deathRate: (elderly / Math.max(1, totalPop)) * 30,
      naturalGrowthRate: (birthRate * 15) - ((elderly / Math.max(1, totalPop)) * 30),
      dependencyRatio: (youth + elderly) / Math.max(1, workingAge),
      medianAge: 30 + (elderly / Math.max(1, totalPop)) * 40
    };
  }
  
  private trackPopulationMilestones(
    totalPopInMillions: number,
    currentPopulation: number,
    currentYear: number,
    milestones: { peakPopulation: number; peakYear: number; halfPoint: number | null; extinctionPoint: number | null }
  ) {
    const updated = { ...milestones };
    
    if (totalPopInMillions > updated.peakPopulation) {
      updated.peakPopulation = totalPopInMillions;
      updated.peakYear = currentYear;
    }
    
    if (!updated.halfPoint && totalPopInMillions <= currentPopulation / 2) {
      updated.halfPoint = currentYear;
    }
    
    if (!updated.extinctionPoint && totalPopInMillions < 1) {
      updated.extinctionPoint = currentYear;
    }
    
    return updated;
  }
  
  private generatePyramid(youth: number, workingAge: number, elderly: number): AgeGroup[] {
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