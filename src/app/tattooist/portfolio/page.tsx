'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Image } from 'lucide-react';
import NextImage from 'next/image';

interface PortfolioItem {
  id: string;
  imageUrl: string;
  description: string;
  styleTags: string[];
  createdAt: string;
}

export default function PortfolioManagementPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: '',
    description: '',
    styleTags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commonTags = [
    'Japanese Traditional',
    'American Traditional',
    'Neo Traditional',
    'Geometric',
    'Black & Grey',
    'Color Work',
    'Realism',
    'Portrait',
    'Watercolor',
    'Minimalist',
    'Fine Line',
    'Tribal',
    'Script',
    'Floral',
    'Animal',
    'Abstract'
  ];

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/tattooist/portfolio', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const data = await response.json();
      setPortfolio(data.portfolio || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addTag = (tag: string) => {
    const currentTags = formData.styleTags ? formData.styleTags.split(',').map(t => t.trim()) : [];
    if (!currentTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        styleTags: currentTags.length > 0 ? `${prev.styleTags}, ${tag}` : tag
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const tags = formData.styleTags
        ? formData.styleTags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];

      const response = await fetch('/api/tattooist/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: formData.imageUrl,
          description: formData.description,
          styleTags: tags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add portfolio item');
      }

      const data = await response.json();
      setPortfolio(prev => [data.portfolioItem, ...prev]);
      setFormData({ imageUrl: '', description: '', styleTags: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      alert('Failed to add portfolio item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
            <p className="text-gray-600 mt-1">Showcase your work and attract new clients</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Portfolio Item
          </Button>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Add Portfolio Item</CardTitle>
                    <CardDescription>Share your latest work with potential clients</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="imageUrl">Image URL *</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="https://example.com/tattoo-image.jpg"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload your image to a hosting service and paste the URL here
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe this piece - style, size, inspiration, etc."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="styleTags">Style Tags</Label>
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {commonTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => addTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Input
                      id="styleTags"
                      name="styleTags"
                      placeholder="e.g., Japanese Traditional, Dragon, Black & Grey"
                      value={formData.styleTags}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate multiple tags with commas, or click tags above to add them
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? 'Adding...' : 'Add Portfolio Item'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Portfolio Grid */}
        {portfolio.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" alt="No portfolio items" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h3>
              <p className="text-gray-600 mb-6">
                Start building your portfolio to showcase your work and attract new clients.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Piece
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => (
              <Card key={item.id} className="group">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                    {item.imageUrl ? (
                      <NextImage
                        src={item.imageUrl}
                        alt={item.description || 'Portfolio item'}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600">
                      Portfolio Image
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-900 font-medium mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.styleTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.styleTags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.styleTags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{portfolio.length}</div>
              <div className="text-sm text-gray-600">Total Pieces</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {new Set(portfolio.flatMap(item => item.styleTags)).size}
              </div>
              <div className="text-sm text-gray-600">Unique Styles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {portfolio.length > 0 ? new Date(portfolio[portfolio.length - 1].createdAt).getFullYear() : '-'}
              </div>
              <div className="text-sm text-gray-600">Latest Update</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}