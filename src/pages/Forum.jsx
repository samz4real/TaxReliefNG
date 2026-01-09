import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageSquare, Heart, Plus, Search, 
  User, Clock, Pin, Send, ArrowLeft
} from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';

const categories = [
  { value: 'general', label: 'General Discussion', color: 'bg-slate-100 text-slate-700' },
  { value: 'paye', label: 'PAYE & Salaries', color: 'bg-blue-100 text-blue-700' },
  { value: 'vat', label: 'VAT Questions', color: 'bg-green-100 text-green-700' },
  { value: 'exemptions', label: 'Exemptions & Reliefs', color: 'bg-purple-100 text-purple-700' },
  { value: 'business', label: 'Business Tax', color: 'bg-amber-100 text-amber-700' },
  { value: 'tips', label: 'Tips & Advice', color: 'bg-emerald-100 text-emerald-700' }
];

export default function Forum() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [newComment, setNewComment] = useState('');

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 50)
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['forum-comments', selectedPost?.id],
    queryFn: () => base44.entities.ForumComment.filter({ post_id: selectedPost?.id }),
    enabled: !!selectedPost?.id
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const post = await base44.entities.ForumPost.create({
        ...postData,
        author_name: user?.full_name || 'Anonymous',
        likes: 0,
        comments_count: 0
      });

      // Check for badge
      const userPosts = await base44.entities.ForumPost.filter({ created_by: user?.email });
      if (userPosts.length === 1) {
        await base44.entities.UserBadge.create({
          user_email: user.email,
          badge_type: 'forum_contributor',
          earned_date: new Date().toISOString().split('T')[0]
        });
        toast.success('💬 Badge earned: Forum Contributor!');
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setIsCreateOpen(false);
      setNewPost({ title: '', content: '', category: 'general' });
      toast.success('Post created successfully!');
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      const comment = await base44.entities.ForumComment.create({
        ...commentData,
        author_name: user?.full_name || 'Anonymous',
        likes: 0
      });

      // Update post comments count
      await base44.entities.ForumPost.update(selectedPost.id, {
        comments_count: (selectedPost.comments_count || 0) + 1
      });

      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments'] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setNewComment('');
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (post) => {
      return base44.entities.ForumPost.update(post.id, {
        likes: (post.likes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    }
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStyle = (category) => {
    return categories.find(c => c.value === category)?.color || 'bg-slate-100 text-slate-700';
  };

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto pb-24 lg:pb-8">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedPost(null)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Forum
        </Button>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{selectedPost.author_name}</span>
                <Badge className={getCategoryStyle(selectedPost.category)}>
                  {selectedPost.category}
                </Badge>
                {selectedPost.is_pinned && (
                  <Pin className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-3">{selectedPost.title}</h1>
              <p className="text-slate-600 whitespace-pre-wrap mb-4">{selectedPost.content}</p>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(new Date(selectedPost.created_date), 'MMM d, yyyy')}
                </span>
                <button 
                  onClick={() => likePostMutation.mutate(selectedPost)}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-4 h-4" /> {selectedPost.likes || 0}
                </button>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {selectedPost.comments_count || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-800">Comments ({comments.length})</h2>
          
          {user && (
            <Card className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[80px] mb-2"
                  />
                  <Button
                    onClick={() => createCommentMutation.mutate({ 
                      post_id: selectedPost.id, 
                      content: newComment 
                    })}
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    size="sm"
                  >
                    <Send className="w-4 h-4" /> Post Comment
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author_name}</span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(comment.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {comments.length === 0 && (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No comments yet. Be the first to comment!</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 lg:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Community Forum</h1>
          <p className="text-slate-600">Discuss tax topics and share tips with others</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Input
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <Select
                  value={newPost.category}
                  onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Textarea
                  placeholder="Write your post..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="min-h-[150px]"
                />
              </div>
              <Button
                onClick={() => createPostMutation.mutate(newPost)}
                disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.value
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-full mb-2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </Card>
          ))
        ) : (
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-700">{post.author_name}</span>
                        <Badge className={getCategoryStyle(post.category)}>
                          {post.category}
                        </Badge>
                        {post.is_pinned && (
                          <Pin className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-2">{post.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(post.created_date), 'MMM d')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No posts found</h3>
            <p className="text-slate-500 mb-4">Be the first to start a discussion!</p>
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Post
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}