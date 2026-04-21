import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminArticlesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - replace with API call
  useEffect(() => {
    const mockArticles = [
      { id: '1', category: 'news', title: 'Calusa Earns Platinum STEM Designation', description: 'For the seventh consecutive year...', author: 'Sofia Martinez', grade: '5th Grade', date: 'Apr 14, 2026', featured: true, views: 145 },
      { id: '2', category: 'arts', title: 'Spring Art Show Preview', description: 'A sneak peek at the amazing student artwork...', author: 'Lucas Chen', grade: '4th Grade', date: 'Apr 14, 2026', featured: false, views: 87 },
      { id: '3', category: 'sports', title: 'Kickball Champions!', description: '5th graders claim victory in the school kickball championship...', author: 'Marcus Williams', grade: '5th Grade', date: 'Apr 14, 2026', featured: false, views: 124 }
    ];
    setArticles(mockArticles);
    setLoading(false);
  }, []);

  const handleEdit = (articleId) => {
    // Navigate to edit page or open modal
    toast({
      title: "Edit Article",
      description: `Editing article ${articleId}. Full edit page coming soon!`,
    });
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      // Remove from state
      setArticles(articles.filter(a => a.id !== articleId));
      
      toast({
        title: "Article Deleted",
        description: "The article has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateNew = () => {
    navigate('/submit-story');
  };

  const toggleFeatured = (articleId) => {
    setArticles(articles.map(article => 
      article.id === articleId 
        ? { ...article, featured: !article.featured }
        : article
    ));
    
    toast({
      title: "Updated",
      description: "Article featured status updated.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button 
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="text-white border-white hover:bg-blue-800 mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Articles Management</h1>
          <p className="text-blue-200 text-sm">Create, edit, and manage all articles</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Articles ({articles.length})</h2>
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleCreateNew}
          >
            <Plus size={18} className="mr-2" />
            Create New Article
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <Card className="p-12 text-center">
            <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No articles yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first article!</p>
            <Button onClick={handleCreateNew}>
              <Plus size={18} className="mr-2" />
              Create Article
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                        {article.category}
                      </span>
                      {article.featured && (
                        <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                          ⭐ FEATURED
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{article.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {article.author}</span>
                      <span>•</span>
                      <span>{article.grade}</span>
                      <span>•</span>
                      <span>{article.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {article.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(article.id)}
                      className="hover:bg-blue-50"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => toggleFeatured(article.id)}
                      className={article.featured ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-500 hover:bg-gray-600"}
                    >
                      {article.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticlesPage;