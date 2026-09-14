import React, { useState, useEffect } from 'react';

interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  accentColor: string;
  titleColor: string;
  primaryButtonColor: string;
  secondaryButtonColor: string;
}

export const ThemeCustomizer = () => {
  const [colors, setColors] = useState<ThemeColors>({
    primaryColor: '#5236ab',
    secondaryColor: '#200a58',
    backgroundColor: '#f6f8f9',
    accentColor: '#00d4ff',
    titleColor: '#151515',
    primaryButtonColor: '#5236ab',
    secondaryButtonColor: '#ffffff',
  });

  // Apply colors to CSS variables in real-time
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Primary color affects multiple elements
    root.style.setProperty('--primary', colors.primaryColor);
    root.style.setProperty('--primary-button-color', colors.primaryColor);
    root.style.setProperty('--secondary-button-border-color', colors.primaryColor);
    root.style.setProperty('--search-border-color', colors.primaryColor);
    root.style.setProperty('--active-tab-border-color', colors.primaryColor);
    
    root.style.setProperty('--accent', colors.accentColor);
    root.style.setProperty('--title-color', colors.titleColor);
    root.style.setProperty('--secondary-button-color', colors.secondaryButtonColor);
    
    // Secondary color affects card titles
    root.style.setProperty('--card-title-color', colors.secondaryColor);
    
    // Background color affects page/body background
    body.style.backgroundColor = colors.backgroundColor;
  }, [colors]);

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const resetColors = () => {
    setColors({
      primaryColor: '#5236ab',
      secondaryColor: '#200a58',
      backgroundColor: '#f6f8f9',
      accentColor: '#00d4ff',
      titleColor: '#151515',
      primaryButtonColor: '#5236ab',
      secondaryButtonColor: '#ffffff',
    });
  };

  const colorFields = [
    { key: 'primaryColor' as keyof ThemeColors, label: 'Primär färg', description: 'Huvudfärg för applikationen' },
    { key: 'secondaryColor' as keyof ThemeColors, label: 'Sekundär färg', description: 'Färg för korttitlar och rubriker' },
    { key: 'backgroundColor' as keyof ThemeColors, label: 'Bakgrundsfärg', description: 'Bakgrund för hela sidan' },
    { key: 'accentColor' as keyof ThemeColors, label: 'Accentfärg', description: 'Färg för detaljer och highlights' },
    { key: 'titleColor' as keyof ThemeColors, label: 'Titelfärg', description: 'Färg för rubriker och titlar' },
    { key: 'primaryButtonColor' as keyof ThemeColors, label: 'Primär knappfärg', description: 'Färg för primära knappar' },
    { key: 'secondaryButtonColor' as keyof ThemeColors, label: 'Sekundär knappfärg', description: 'Färg för sekundära knappar' },
  ];

  return (
    <div className="theme-customizer-container">
      <div className="row">
        <div className="col-lg-8">
          <div className="theme-customizer-card">
            <div className="theme-customizer-header">
              <h2 className="theme-customizer-title">Färginställningar</h2>
              <p className="theme-customizer-description">
                Anpassa färgtemat för hela applikationen. Ändringarna tillämpas direkt.
              </p>
            </div>

            <div className="theme-customizer-body">
              <div className="color-controls-grid">
                {colorFields.map((field) => (
                  <div key={field.key} className="color-control-item">
                    <div className="color-control-header">
                      <label className="color-control-label">{field.label}</label>
                      <span className="color-control-value">{colors[field.key]}</span>
                    </div>
                    <p className="color-control-description">{field.description}</p>
                    <div className="color-control-input-wrapper">
                      <input
                        type="color"
                        className="color-control-input"
                        value={colors[field.key]}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                      />
                      <input
                        type="text"
                        className="color-control-text-input"
                        value={colors[field.key]}
                        onChange={(e) => handleColorChange(field.key, e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="theme-customizer-actions">
                <button className="btn-reset-theme" onClick={resetColors}>
                  <i className="fa-solid fa-rotate-left"></i>
                  Återställ till standard
                </button>
                <button className="btn-save-theme">
                  <i className="fa-solid fa-floppy-disk"></i>
                  Spara tema
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="theme-preview-card">
            <h3 className="theme-preview-title">Förhandsvisning</h3>
            <div className="theme-preview-content">
              <div className="theme-preview-sample">
                <h4 className="sample-title">Exempelrubrik</h4>
                <p className="sample-text">Detta är exempeltext som visar hur ditt tema ser ut.</p>
                <div className="sample-buttons">
                  <button className="sample-primary-btn">Primär knapp</button>
                  <button className="sample-secondary-btn">Sekundär knapp</button>
                </div>
                <div className="sample-card">
                  <p>Exempelkort med bakgrundsfärg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};