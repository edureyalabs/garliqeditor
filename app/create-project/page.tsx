'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { Box, Flex, Heading, Button, Input, Text, Grid } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';

export default function CreateProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('16:9');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || creating) return;

    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name: name.trim(), aspect_ratio: aspectRatio })
      });

      const result = await response.json();
      
      if (!result.success) throw new Error(result.error);

      router.push(`/studio/${result.project.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create project');
      setCreating(false);
    }
  };

  return (
    <SubscriptionGuard requireActive={true}>
      <Flex
        minH="100vh"
        bg="black"
        color="white"
        alignItems="center"
        justifyContent="center"
        p={6}
      >
        <Box w="full" maxW="md">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            gap={2}
            color="gray.400"
            mb={6}
            _hover={{ color: 'white' }}
            transition="all 0.2s"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Box
            bg="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
            borderRadius="xl"
            p={8}
          >
            <Heading as="h1" size="xl" fontWeight="bold" mb={6}>
              Create New Project
            </Heading>

            <Flex flexDirection="column" gap={6}>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight="medium" color="gray.400" mb={2}>
                  Project Name
                </Field.Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Video"
                  bg="black"
                  borderColor="gray.700"
                  borderRadius="lg"
                  px={4}
                  py={3}
                  _focus={{ borderColor: 'purple.500', outline: 'none' }}
                  maxLength={100}
                />
              </Field.Root>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.400"
                  mb={3}
                >
                  Aspect Ratio
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Button
                    onClick={() => setAspectRatio('16:9')}
                    px={4}
                    py={6}
                    h="auto"
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={aspectRatio === '16:9' ? 'purple.600' : 'gray.700'}
                    bg={aspectRatio === '16:9' ? 'purple.600/10' : 'transparent'}
                    _hover={{
                      borderColor: aspectRatio === '16:9' ? 'purple.600' : 'gray.600'
                    }}
                    transition="all 0.2s"
                    flexDirection="column"
                  >
                    <Text fontSize="lg" fontWeight="semibold" mb={1}>
                      16:9
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Landscape
                    </Text>
                  </Button>
                  
                  <Button
                    onClick={() => setAspectRatio('9:16')}
                    px={4}
                    py={6}
                    h="auto"
                    borderRadius="lg"
                    borderWidth="2px"
                    borderColor={aspectRatio === '9:16' ? 'purple.600' : 'gray.700'}
                    bg={aspectRatio === '9:16' ? 'purple.600/10' : 'transparent'}
                    _hover={{
                      borderColor: aspectRatio === '9:16' ? 'purple.600' : 'gray.600'
                    }}
                    transition="all 0.2s"
                    flexDirection="column"
                  >
                    <Text fontSize="lg" fontWeight="semibold" mb={1}>
                      9:16
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Portrait
                    </Text>
                  </Button>
                </Grid>
              </Box>

              <Button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                w="full"
                py={3}
                colorPalette="purple"
                borderRadius="lg"
                fontWeight="medium"
                opacity={!name.trim() || creating ? 0.5 : 1}
                cursor={!name.trim() || creating ? 'not-allowed' : 'pointer'}
                transition="all 0.2s"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </SubscriptionGuard>
  );
}