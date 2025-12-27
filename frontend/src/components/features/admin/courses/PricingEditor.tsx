'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus } from 'lucide-react';

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
}

interface PricingEditorProps {
  tiers: PricingTier[];
  onChange: (tiers: PricingTier[]) => void;
}

export function PricingEditor({ tiers, onChange }: PricingEditorProps) {
  const [newFeature, setNewFeature] = useState<{ [tierId: string]: string }>({});

  const addTier = () => {
    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      name: 'New Tier',
      price: 0,
      duration: 30,
      features: [],
    };
    onChange([...tiers, newTier]);
  };

  const updateTier = (id: string, updates: Partial<PricingTier>) => {
    onChange(tiers.map((tier) => (tier.id === id ? { ...tier, ...updates } : tier)));
  };

  const removeTier = (id: string) => {
    onChange(tiers.filter((tier) => tier.id !== id));
  };

  const addFeature = (tierId: string) => {
    const feature = newFeature[tierId]?.trim();
    if (!feature) return;

    const tier = tiers.find((t) => t.id === tierId);
    if (tier) {
      updateTier(tierId, { features: [...tier.features, feature] });
      setNewFeature({ ...newFeature, [tierId]: '' });
    }
  };

  const removeFeature = (tierId: string, featureIndex: number) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (tier) {
      updateTier(tierId, {
        features: tier.features.filter((_, index) => index !== featureIndex),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Pricing Tiers</h3>
        <Button onClick={addTier} size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Add Tier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div key={tier.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="flex items-start justify-between">
              <Input
                value={tier.name}
                onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                className="font-semibold"
                placeholder="Tier name"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeTier(tier.id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Price"
                value={tier.price}
                onChange={(e) => updateTier(tier.id, { price: parseFloat(e.target.value) || 0 })}
                step="0.01"
              />
              <Input
                type="number"
                label="Duration (days)"
                value={tier.duration}
                onChange={(e) => updateTier(tier.id, { duration: parseInt(e.target.value) || 30 })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Features</label>
              <div className="space-y-2">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <Badge variant="default" className="flex-1 justify-between">
                      <span className="truncate">{feature}</span>
                      <button
                        onClick={() => removeFeature(tier.id, index)}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newFeature[tier.id] || ''}
                  onChange={(e) => setNewFeature({ ...newFeature, [tier.id]: e.target.value })}
                  placeholder="Add feature"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature(tier.id);
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addFeature(tier.id)}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tiers.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-500 mb-4">No pricing tiers yet</p>
          <Button onClick={addTier} size="sm">
            Create First Tier
          </Button>
        </div>
      )}
    </div>
  );
}
